import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/Booking.css'

const BookingPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMission, setSelectedMission] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const missionsRes = await axios.get('http://localhost:5000/api/missions');
        const vehiclesRes = await axios.get('http://localhost:5000/api/vehicles');
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings');

        setMissions(missionsRes.data);
        setVehicles(vehiclesRes.data);
        setBookings(bookingsRes.data);

        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setIsAdmin(decodedToken.role === 'admin');
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

    const userId = jwtDecode(token).id;

    try {
      const newBooking = {
        missionId: selectedMission,
        userId: userId,
        vehicleId: selectedVehicle,
        bookingDate: selectedDate,
      };

      await axios.post('http://localhost:5000/api/bookings', newBooking, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
      setBookings(bookingsRes.data);

      setError('');
      alert('Booking Completed');
    } catch (error) {
      setError('');
      alert('Fail to create Booking !');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookings.filter(booking => booking._id !== bookingId));
        alert('Booking deleted successfully');
      } catch (error) {
        setError('Failed to delete booking');
        alert('Failed to delete booking');
      }
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Booking Page</h2>
      <button onClick={handleBackClick} className="bg-blue-500 text-white py-2 px-4 rounded mb-6">
        Back to Dashboard
      </button>
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Create Booking Section */}
        {!isAdmin && (
          <div className="lg:w-1/3">
            <h3 className="text-xl font-semibold mb-4">Create New Booking</h3>
            <div className="border border-gray-300 p-6 rounded-lg shadow-md bg-white">
              <div className="mb-4">
                <label className="block mb-2 font-bold">Mission:</label>
                <select
                  onChange={(e) => setSelectedMission(e.target.value)}
                  value={selectedMission}
                  className="w-full border border-gray-300 p-2 rounded"
                >
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
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold">Vehicle:</label>
                <select
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  value={selectedVehicle}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} ({vehicle.license_plate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              
              <button onClick={handleCreateBooking} className="bg-green-500 text-white py-2 px-4 rounded w-full">
                Create Booking
              </button>
            </div>
          </div>
        )}
    {/* Bookings Section */}
      <div className="lg:w-2/3">
          <h3 className="text-xl font-semibold mb-4">Bookings</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <li
                key={booking._id}
                className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-lg">{booking.mission.mission_name}</p>
                  <span
                    className={`py-1 px-2 rounded-full text-xs font-semibold ${
                      booking.status === 'Pending'
                        ? 'bg-yellow-500 text-white'
                        : booking.status === 'Completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Vehicle:</span> {booking.vehicle.name}
                </p>

                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Booking Date:</span>{' '}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-full transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
