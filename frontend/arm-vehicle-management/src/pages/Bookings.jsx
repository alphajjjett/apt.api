import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBookings(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <h2>Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Vehicle</th>
            <th>Mission</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking.user_id}</td>
              <td>{booking.vehicle_id}</td>
              <td>{booking.mission_id}</td>
              <td>{booking.start_time}</td>
              <td>{booking.end_time}</td>
              <td>{booking.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bookings;
