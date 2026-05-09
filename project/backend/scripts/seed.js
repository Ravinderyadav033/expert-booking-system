const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Expert = require('../models/Expert');

const EXPERTS = [
  { name: 'Dr. Priya Sharma', category: 'Health', experience: 12, rating: 4.9, bio: 'Board-certified physician specializing in preventive medicine and holistic wellness. Former head of medicine at AIIMS Delhi.', hourlyRate: 5000, skills: ['Preventive Medicine', 'Nutrition', 'Mental Wellness', 'Chronic Disease Management'] },
  { name: 'Arjun Mehta', category: 'Technology', experience: 8, rating: 4.8, bio: 'Ex-Google Staff Engineer with expertise in distributed systems, AI/ML, and cloud architecture. IIT Bombay alumni.', hourlyRate: 8000, skills: ['System Design', 'Machine Learning', 'Cloud Architecture', 'Python', 'Go'] },
  { name: 'Adv. Sunita Rao', category: 'Legal', experience: 15, rating: 4.7, bio: 'Senior advocate at Delhi High Court. Specializes in corporate law, startup compliance, and intellectual property.', hourlyRate: 6000, skills: ['Corporate Law', 'IP Rights', 'Startup Compliance', 'Contract Law'] },
  { name: 'Rahul Kapoor', category: 'Finance', experience: 10, rating: 4.8, bio: 'SEBI-registered investment advisor and CFP. Expert in equity, mutual funds, tax planning, and wealth management.', hourlyRate: 4500, skills: ['Equity Research', 'Mutual Funds', 'Tax Planning', 'Wealth Management'] },
  { name: 'Neha Gupta', category: 'Marketing', experience: 7, rating: 4.6, bio: 'Growth marketing expert who scaled 3 startups to Series B. Specializes in D2C brands and digital growth hacking.', hourlyRate: 5500, skills: ['Growth Hacking', 'SEO/SEM', 'Social Media', 'Content Strategy'] },
  { name: 'Vikram Singh', category: 'Design', experience: 9, rating: 4.7, bio: 'Product designer with experience at Flipkart and Zomato. Expert in UX research, design systems, and product strategy.', hourlyRate: 5000, skills: ['UX Design', 'Design Systems', 'Figma', 'Product Strategy'] },
  { name: 'Anita Krishnan', category: 'Business', experience: 18, rating: 4.9, bio: 'Serial entrepreneur and business mentor. Founded 2 successful startups. Advisor to 15+ early-stage companies.', hourlyRate: 10000, skills: ['Business Strategy', 'Fundraising', 'Go-to-Market', 'Team Building'] },
  { name: 'Prof. Mohan Das', category: 'Education', experience: 20, rating: 4.8, bio: 'Former IIM professor specializing in management education. Expert in GMAT, CAT prep, and MBA admissions consulting.', hourlyRate: 3500, skills: ['CAT Prep', 'GMAT Coaching', 'MBA Admissions', 'Resume Building'] },
  { name: 'Deepika Nair', category: 'Technology', experience: 6, rating: 4.5, bio: 'Full-stack developer and AWS Solutions Architect. Expert in React, Node.js, serverless architecture and DevOps.', hourlyRate: 6000, skills: ['React', 'Node.js', 'AWS', 'DevOps', 'TypeScript'] },
  { name: 'Sanjay Patel', category: 'Finance', experience: 14, rating: 4.6, bio: 'CA and financial planner with expertise in startup CFO services, fundraising strategy, and financial modeling.', hourlyRate: 7000, skills: ['Financial Modeling', 'Fundraising', 'Startup CFO', 'Tax Planning'] },
  { name: 'Dr. Kavitha Menon', category: 'Health', experience: 11, rating: 4.8, bio: 'Clinical psychologist and therapist specializing in anxiety, depression, and workplace mental health programs.', hourlyRate: 4000, skills: ['CBT', 'Anxiety Management', 'Depression', 'Mindfulness'] },
  { name: 'Rohit Agarwal', category: 'Business', experience: 13, rating: 4.7, bio: 'Operations consultant and supply chain expert. Helped 30+ SMEs optimize operations and scale internationally.', hourlyRate: 8000, skills: ['Supply Chain', 'Operations', 'Process Optimization', 'International Expansion'] },
];

function generateSlots(expertIndex) {
  const slots = [];
  const today = new Date();
  const timeRanges = [
    { start: '09:00', end: '10:00' }, { start: '10:30', end: '11:30' },
    { start: '12:00', end: '13:00' }, { start: '14:00', end: '15:00' },
    { start: '15:30', end: '16:30' }, { start: '17:00', end: '18:00' },
  ];

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    if (date.getDay() === 0) continue;
    const dateStr = date.toISOString().split('T')[0];
    const available = timeRanges.filter((_, i) => (i + expertIndex) % 3 !== 0);
    available.forEach(({ start, end }) => {
      slots.push({ date: dateStr, startTime: start, endTime: end, isBooked: false });
    });
  }
  return slots;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expert-booking');
    console.log('Connected to MongoDB');
    await Expert.deleteMany({});
    console.log('Cleared existing experts');
    const expertsWithSlots = EXPERTS.map((expert, i) => ({ ...expert, availableSlots: generateSlots(i) }));
    await Expert.insertMany(expertsWithSlots);
    console.log(`Seeded ${EXPERTS.length} experts with time slots`);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
