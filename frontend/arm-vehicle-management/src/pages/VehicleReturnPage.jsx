import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const VehicleReturnPage = () => {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    booking_id: '',
    vehicle_id: '', // จะเก็บ ObjectId ของ vehicle
    user_id: '', // จะเก็บ ObjectId ของ user
    return_date: '',
    condition: '',
    fuel_level: '',
    remark: ''
  });
  
  const [vehicleDisplay, setVehicleDisplay] = useState('');  // เก็บทะเบียนรถที่จะแสดง
  const [userDisplay, setUserDisplay] = useState('');        // เก็บชื่อผู้ใช้ที่จะแสดง
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleBookingChange = (e) => {
    const selectedBookingId = e.target.value;
    const selectedBooking = bookings.find(booking => booking._id === selectedBookingId);
    
    const userIdFromToken = getUserIdFromToken();
    
    if (selectedBooking) {
      const vehicleId = selectedBooking.vehicle ? selectedBooking.vehicle._id : '';
      const vehiclePlate = selectedBooking.vehicle ? selectedBooking.vehicle.license_plate : ''; // แสดงทะเบียนรถ
      const userId = selectedBooking.user ? selectedBooking.user._id : userIdFromToken;
      const userName = selectedBooking.user ? selectedBooking.user.name : ''; // แสดงชื่อผู้ใช้

      // Log ObjectId values for debugging
      console.log('Selected Vehicle ID (ObjectId):', vehicleId);
      console.log('Selected User ID (ObjectId):', userId);

      setFormData({
        ...formData,
        booking_id: selectedBooking._id,
        vehicle_id: vehicleId,  // เก็บ _id ของ vehicle เพื่อส่งไปยัง backend
        user_id: userId,        // เก็บ _id ของ user เพื่อส่งไปยัง backend
        return_date: selectedBooking.mission && selectedBooking.mission.end_date 
          ? new Date(selectedBooking.mission.end_date).toISOString().split('T')[0] 
          : ''
      });

      // แสดงทะเบียนรถ และชื่อผู้ใช้บนหน้าเว็บ
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
    <div>
      <h2>Vehicle Return Management</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Booking (Mission):</label>
          <select name="booking_id" value={formData.booking_id} onChange={handleBookingChange}>
            <option value="">Select Mission</option> 
            {bookings.map(booking => (
              <option key={booking._id} value={booking._id}>
                {booking.mission.mission_name} - {booking.vehicle.license_plate} {/* แสดงทะเบียนรถ */}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Vehicle:</label>
          <input type="text" value={vehicleDisplay} readOnly />  {/* แสดงทะเบียนรถ */}
        </div>

        <div>
          <label>User:</label>
          <input type="text" value={userDisplay} readOnly />  {/* แสดงชื่อผู้ใช้งาน */}
        </div>

        <div>
          <label>Return Date:</label>
          <input
            type="date"
            name="return_date"
            value={formData.return_date}
            onChange={handleInputChange}
            readOnly
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
