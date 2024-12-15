import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingStatus.css'

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
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Booking Status Page</h2>
      <button 
        onClick={handleBackClick} 
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Back to Dashboard
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}  {/* Show error message if any */}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Bookings List</h3>
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li key={booking._id} className="border-b border-gray-300 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-lg font-medium">Mission: {booking.mission.mission_name}</p>
                  <p className="text-sm text-gray-500">Vehicle: {booking.vehicle.name}</p>
                  <p className="text-sm text-gray-500">Status: {booking.status}</p>
                  <p className="text-sm text-gray-500">Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                </div>

                {/* Only admins can update the status */}
                {isAdmin && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Status:</label>
                    <select 
                      value={booking.status} 
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookingStatusPage;
