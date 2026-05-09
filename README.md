# ExpertConnect — Real-Time Expert Session Booking System

A full-stack web application to book 1:1 sessions with domain experts.

**Stack:** React + Node.js + Express + MongoDB + Socket.io

---

## Features
- Expert listing with search, category filter & pagination
- Real-time slot availability (Socket.io)
- Double-booking prevention (MongoDB transactions + unique index)
- Full booking form with validation
- My Bookings dashboard with status tracking

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally OR a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
npm install
```

Edit `backend/.env` — set your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/expert-booking
```

Seed the database (run once):
```bash
node scripts/seed.js
```

Start the server:
```bash
npm run dev
```
Backend runs on **http://localhost:5000**

---

### 2. Frontend

Open a **new terminal**:
```bash
cd frontend
npm install
npm start
```
Frontend runs on **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List with pagination & filters |
| GET | `/api/experts/:id` | Expert detail + slots |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings?email=` | My bookings |
| PATCH | `/api/bookings/:id/status` | Update status |
| GET | `/api/health` | Health check |

---

## Project Structure

```
expert-booking/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── expertController.js
│   │   └── bookingController.js
│   ├── models/
│   │   ├── Expert.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── scripts/seed.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ExpertCard.jsx
    │   │   └── BookingModal.jsx
    │   ├── context/SocketContext.jsx
    │   ├── pages/
    │   │   ├── ExpertListPage.jsx
    │   │   ├── ExpertDetailPage.jsx
    │   │   └── MyBookingsPage.jsx
    │   ├── utils/api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    └── package.json
```
