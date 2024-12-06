import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleReturnPage = () => {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    booking_id: '',
    vehicle_id: '',
    user_id: '',
    return_date: '',
    condition: '',
    fuel_level: '',
    remark: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings');
        setBookings(response.data); // Assuming this endpoint returns populated data with vehicle and user info
      } catch (error) {
        setError('Error fetching bookings');
      }
    };

    fetchBookings();
  }, []);

  const handleBookingChange = (e) => {
    const selectedBooking = bookings.find(booking => booking._id === e.target.value);
    if (selectedBooking) {
      setFormData({
        ...formData,
        booking_id: selectedBooking._id,
        vehicle_id: selectedBooking.vehicle_id._id, // Assuming booking has vehicle_id populated
        user_id: selectedBooking.user_id._id, // Assuming booking has user_id populated
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vehicle-returns', formData);
      setSuccess('Vehicle return created successfully');
      setError('');
      setFormData({
        booking_id: '',
        vehicle_id: '',
        user_id: '',
        return_date: '',
        condition: '',
        fuel_level: '',
        remark: ''
      });
    } catch (error) {
      setError('Error creating vehicle return');
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>Vehicle Return Management</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Form to create a new vehicle return */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Booking:</label>
          <select name="booking_id" value={formData.booking_id} onChange={handleBookingChange}>
            <option value="">Select Booking</option> 
            {bookings.map(booking => (
              <option key={booking._id} value={booking._id}>
                {booking.start_time} - {booking.end_time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Vehicle ID:</label>
          <input
            type="text"
            name="vehicle_id"
            value={formData.vehicle_id}
            readOnly
          />
        </div>
        <div>
          <label>User ID:</label>
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            readOnly
          />
        </div>
        <div>
          <label>Return Date:</label>
          <input
            type="date"
            name="return_date"
            value={formData.return_date}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Condition:</label>
          <select name="condition" value={formData.condition} onChange={handleInputChange}>
            <option value="">Select Condition</option>
            <option value="good">Good</option>
            <option value="damaged">Damaged</option>
            <option value="needs repair">Needs Repair</option>
          </select>
        </div>
        <div>
          <label>Fuel Level:</label>
          <input
            type="number"
            name="fuel_level"
            value={formData.fuel_level}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Remark:</label>
          <input
            type="text"
            name="remark"
            value={formData.remark}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default VehicleReturnPage;
