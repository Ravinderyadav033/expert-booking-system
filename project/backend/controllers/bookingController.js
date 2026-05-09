const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { validationResult } = require('express-validator');

exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { expertId, clientName, clientEmail, clientPhone, date, startTime, endTime, notes } = req.body;
  const timeSlot = `${startTime}-${endTime}`;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expert = await Expert.findById(expertId).session(session);
    if (!expert) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    const slotIndex = expert.availableSlots.findIndex(
      (s) => s.date === date && s.startTime === startTime && s.endTime === endTime
    );

    if (slotIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    if (expert.availableSlots[slotIndex].isBooked) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another slot.',
      });
    }

    const existingBooking = await Booking.findOne({
      expert: expertId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another slot.',
      });
    }

    expert.availableSlots[slotIndex].isBooked = true;
    expert.totalBookings += 1;
    await expert.save({ session });

    const booking = new Booking({
      expert: expertId,
      expertName: expert.name,
      expertCategory: expert.category,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      startTime,
      endTime,
      notes: notes || '',
      status: 'pending',
    });

    await booking.save({ session });
    await session.commitTransaction();

    const io = req.app.get('io');
    if (io) {
      io.to(`expert-${expertId}`).emit('slot-booked', {
        expertId,
        date,
        startTime,
        endTime,
        slotId: expert.availableSlots[slotIndex]._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: booking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('createBooking error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by someone else. Please choose another slot.',
      });
    }

    res.status(500).json({ success: false, message: 'Failed to create booking. Please try again.' });
  } finally {
    session.endSession();
  }
};

exports.getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const bookings = await Booking.find({ clientEmail: email.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('getBookingsByEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status === 'cancelled') {
      await Expert.updateOne(
        {
          _id: booking.expert,
          'availableSlots.date': booking.date,
          'availableSlots.startTime': booking.startTime,
        },
        { $set: { 'availableSlots.$.isBooked': false } }
      );

      const io = req.app.get('io');
      if (io) {
        io.to(`expert-${booking.expert}`).emit('slot-freed', {
          expertId: booking.expert,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        });
      }
    }

    res.json({ success: true, message: 'Status updated', data: booking });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};
