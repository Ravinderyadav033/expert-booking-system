import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ExpertListPage from './pages/ExpertListPage';
import ExpertDetailPage from './pages/ExpertDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<ExpertListPage />} />
            <Route path="/expert/:id" element={<ExpertDetailPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Routes>
        </main>
      </Router>
    </SocketProvider>
  );
}

export default App;
