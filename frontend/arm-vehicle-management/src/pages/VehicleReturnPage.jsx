import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';  // นำเข้า jwt-decode

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

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings');
        console.log(response.data);
        setBookings(response.data); // สมมุติว่า API คืนข้อมูล booking ที่มี vehicle และ user_id
      } catch (error) {
        setError('Error fetching bookings');
      }
    };

    fetchBookings();
  }, []);

  // ใช้ jwt-decode เพื่อดึงข้อมูล user จาก token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.id;  // ดึง user ID จาก token
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
    return null;
  };

  const handleBookingChange = (e) => {
    const selectedBooking = bookings.find(booking => booking._id === e.target.value);
    const userIdFromToken = getUserIdFromToken(); // ดึง user ID จาก token
    
    if (selectedBooking) {
      const vehicleId = selectedBooking.vehicle ? selectedBooking.vehicle.license_plate : '';
      const userId = selectedBooking.user ? selectedBooking.user.name : userIdFromToken; // ถ้าไม่มี user_id ใน booking ใช้จาก token
      const returnDate = selectedBooking.mission && selectedBooking.mission.end_date ? new Date(selectedBooking.mission.end_date) : ''; // ดึง end_date จาก mission
  
      // แปลง returnDate เป็น วัน/เดือน/ปี สำหรับการแสดงผล
      const formattedDate = returnDate instanceof Date ? returnDate.toLocaleDateString('th-TH') : '';
  
      // แปลง returnDate เป็น yyyy-MM-dd สำหรับการตั้งค่าใน form
      const inputDateFormat = returnDate instanceof Date ? returnDate.toISOString().split('T')[0] : '';
  
      // Log booking_id, vehicle_id, และ return_date ที่แปลงแล้ว
      console.log('Selected Booking ID:', selectedBooking._id);
      console.log('Selected Vehicle ID:', vehicleId);
      console.log('Formatted Return Date:', formattedDate);  // แสดงวันที่ในรูปแบบ วัน/เดือน/ปี
      console.log('Input Date Format:', inputDateFormat);    // แสดงวันที่ในรูปแบบ yyyy-MM-dd
  
      setFormData({
        ...formData,
        booking_id: selectedBooking._id,  // ใช้ _id แทน object
        vehicle_id: vehicleId,
        user_id: userId,  // ใช้ user ID จาก token หรือจาก booking
        return_date: inputDateFormat  // ตั้งค่า return_date เป็นวันที่ในรูปแบบ yyyy-MM-dd
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
          <label>Booking (Mission):</label>
          <select name="booking_id" value={formData.booking_id} onChange={handleBookingChange}>
            <option value="">Select Mission</option> 
            {bookings.map(booking => (
              <option key={booking._id} value={booking._id}>
                {booking.mission.mission_name}
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
              readOnly  // ให้ฟิลด์นี้เป็น readOnly เพื่อป้องกันการแก้ไข
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
