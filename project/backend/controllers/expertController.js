const Expert = require('../models/Expert');

exports.getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 6, category, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    const [experts, total] = await Promise.all([
      Expert.find(filter)
        .select('-availableSlots')
        .sort(search ? { score: { $meta: 'textScore' } } : { rating: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('getExperts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch experts' });
  }
};

exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).lean();
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    const slotsByDate = {};
    const today = new Date().toISOString().split('T')[0];

    expert.availableSlots.forEach((slot) => {
      if (slot.date >= today) {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
      }
    });

    Object.keys(slotsByDate).forEach((date) => {
      slotsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    res.json({ success: true, data: { ...expert, slotsByDate } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expert ID' });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch expert' });
  }
};
