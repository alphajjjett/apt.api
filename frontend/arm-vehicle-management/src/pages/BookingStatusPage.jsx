import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const BookingStatusPage = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);  // To check if the user is an admin
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch bookings and check if the user is an admin
    const fetchData = async () => {
      try {
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
        setBookings(bookingsRes.data);

        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setIsAdmin(decodedToken.role === 'admin');
        }
      } catch (error) {
        setError('Error fetching bookings');
      }
    };

    fetchData();
  }, []);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local bookings state after status change
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <h2>Booking Status Page</h2>
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>

      {error && <p>{error}</p>}  {/* Show error message if any */}

      <div>
        <h3>Bookings List</h3>
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              <p>Mission: {booking.mission.mission_name}</p>
              <p>Vehicle: {booking.vehicle.name}</p>
              <p>Status: {booking.status}</p>
              <p>Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>

              {/* Only admins can update the status */}
              {isAdmin && (
                <div>
                  <label>Update Status:</label>
                  <select 
                    value={booking.status} 
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookingStatusPage;
