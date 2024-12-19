import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const BookingPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMission, setSelectedMission] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookings(bookings.filter(booking => booking._id !== bookingId));
  
          MySwal.fire({
            title: "Deleted!",
            text: "The booking has been deleted.",
            icon: "success"
          });
        } catch (error) {
          setError('Failed to delete booking');
          MySwal.fire({
            title: "Error",
            text: "There was an error deleting the booking.",
            icon: "error"
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancelled",
          text: "Your booking is safe :)",
          icon: "error"
        });
      }
    });
  };

  return (
    <div className="container mx-auto min-h-screen bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-center mb-6">Booking Page</h2>
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="flex flex-wrap justify-center lg:flex-row gap-8">
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
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Mission Name</TableCell>
                  <TableCell align="right">Vehicle</TableCell>
                  <TableCell align="right">Booking Date</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell component="th" scope="row">
                      {booking.mission.mission_name}
                    </TableCell>
                    <TableCell align="right">{booking.vehicle.name}</TableCell>
                    <TableCell align="right">{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{booking.status}</TableCell>
                    <TableCell align="right">
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-full transition-colors"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
