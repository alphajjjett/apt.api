import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/Return.css';  // Import external CSS

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

  const [vehicleDisplay, setVehicleDisplay] = useState('');
  const [userDisplay, setUserDisplay] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings');
        setBookings(response.data);
      } catch (error) {
        setError('Error fetching bookings');
      }
    };

    fetchBookings();
  }, []);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.id;
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
    return null;
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleBookingChange = (e) => {
    const selectedBookingId = e.target.value;
    const selectedBooking = bookings.find(booking => booking._id === selectedBookingId);

    const userIdFromToken = getUserIdFromToken();

    if (selectedBooking) {
      const vehicleId = selectedBooking.vehicle ? selectedBooking.vehicle._id : '';
      const vehiclePlate = selectedBooking.vehicle ? selectedBooking.vehicle.license_plate : '';
      const userId = selectedBooking.user ? selectedBooking.user._id : userIdFromToken;
      const userName = selectedBooking.user ? selectedBooking.user.name : '';

      setFormData({
        ...formData,
        booking_id: selectedBooking._id,
        vehicle_id: vehicleId,
        user_id: userId,
        return_date: selectedBooking.mission && selectedBooking.mission.end_date 
          ? new Date(selectedBooking.mission.end_date).toISOString().split('T')[0] 
          : ''
      });

      setVehicleDisplay(vehiclePlate);
      setUserDisplay(userName);
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
      setVehicleDisplay('');
      setUserDisplay('');
    } catch (error) {
      setError('Error creating vehicle return');
      setSuccess('');
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-center font-bold text-2xl">Vehicle Return Management</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="label">Booking (Mission):</label>
          <select name="booking_id" value={formData.booking_id} onChange={handleBookingChange} className="input">
            <option value="">Select Mission</option>
            {bookings.map(booking => (
              <option key={booking._id} value={booking._id}>
                {booking.mission.mission_name} - {booking.vehicle.license_plate}
              </option>
            ))}
          </select>
        </div>

        <div className="input-container">
          <label className="label">Vehicle:</label>
          <input type="text" value={vehicleDisplay} readOnly className="input" />
        </div>

        <div className="input-container">
          <label className="label">User:</label>
          <input type="text" value={userDisplay} readOnly className="input" />
        </div>

        <div className="input-container">
          <label className="label">Return Date:</label>
          <input
            type="date"
            name="return_date"
            value={formData.return_date}
            onChange={handleInputChange}
            className="input"
            readOnly
          />
        </div>

        <div className="input-container">
          <label className="label">Condition:</label>
          <select name="condition" value={formData.condition} onChange={handleInputChange} className="input">
            <option value="">Select Condition</option>
            <option value="good">Good</option>
            <option value="damaged">Damaged</option>
            <option value="needs repair">Needs Repair</option>
          </select>
        </div>

        <div className="input-container">
          <label className="label">Fuel Level:</label>
          <input
            type="number"
            name="fuel_level"
            value={formData.fuel_level}
            onChange={handleInputChange}
            className="input"
          />
        </div>

        <div className="input-container">
          <label className="label">Remark:</label>
          <input
            type="text"
            name="remark"
            value={formData.remark}
            onChange={handleInputChange}
            className="input"
          />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
        <br/>
        <button onClick={handleBackClick} className="bg-blue-500 text-white py-2 px-4 rounded mb-6">
              Back to Dashboard
        </button>
      </form>
    </div>
  );
};

export default VehicleReturnPage;
