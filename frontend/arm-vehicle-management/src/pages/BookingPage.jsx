import React, { useState, useEffect } from 'react';
import axios from 'axios';  // For making API calls
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';  // Decoding JWT token

const BookingPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMission, setSelectedMission] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);  // State to track admin role
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch missions, vehicles, and bookings
    const fetchData = async () => {
      try {
        const missionsRes = await axios.get('http://localhost:5000/api/missions');
        const vehiclesRes = await axios.get('http://localhost:5000/api/vehicles');
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
        
        setMissions(missionsRes.data);
        setVehicles(vehiclesRes.data);
        setBookings(bookingsRes.data);

        // Check for user role
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setIsAdmin(decodedToken.role === 'admin');  // Check if the user is an admin
        }
      } catch (error) {
        setError('Error fetching data');
      }
    };
    
    fetchData();
  }, []);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleCreateBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return setError('Please login to create a booking');
    }

    const userId = jwtDecode(token).id;  // Assuming the token contains user information

    try {
      const newBooking = {
        missionId: selectedMission,
        userId: userId,
        vehicleId: selectedVehicle,
        bookingDate: selectedDate
      };

      // Send new booking request to server
      await axios.post('http://localhost:5000/api/bookings', newBooking, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the bookings list
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
      setBookings(bookingsRes.data);
      
      // Clear error if booking is successful
      setError('');

      // Show alert when booking is completed
      alert('Booking Completed');
    } catch (error) {
      setError('');
      alert('Fail to create Booking !');
    }
  };

  return (
    <div>
      <h2>Booking Page</h2>
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>

      {error && <p>{error}</p>}  {/* Show error message if any */}    
      {!isAdmin && (
        <div>
          <h3>Create New Booking</h3>
          <label>
            Mission:
            <select onChange={(e) => setSelectedMission(e.target.value)} value={selectedMission}> 
              <option value="">Select Mission</option>
              {missions.length > 0 ? (
                missions.map((mission) => (
                  <option key={mission._id} value={mission._id}>
                    {mission.mission_name}
                  </option>
                ))
              ) : (
                <option>No missions available</option>
              )}
            </select>
          </label>
          <br />
          <label>
            Vehicle:
            <select onChange={(e) => setSelectedVehicle(e.target.value)} value={selectedVehicle}>
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name} ({vehicle.license_plate})
                </option>
              ))}
            </select>
          </label>
          <div>
            <label>Select Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              required 
            />
          </div>

          <br />
          <button onClick={handleCreateBooking}>
            Create Booking
          </button>
        </div>
      )}
      {/*  {!isAdmin && ()} */}
      <div>
        <h3>Bookings</h3>
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              <p>Mission: {booking.mission.mission_name}</p>
              <p>Vehicle: {booking.vehicle.name}</p>
              <p>Status: {booking.status}</p>
              <p>Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookingPage;
