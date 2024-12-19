import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import { Select } from '@mui/material';

const BookingStatusPage = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);  // To check if the user is an admin

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
      {error && <p className="text-red-500 mt-4">{error}</p>}  {/* Show error message if any */}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="booking status table">
          <TableHead>
            <TableRow>
              <TableCell>Mission Name</TableCell>
              <TableCell>Vehicle Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Booking Date</TableCell>
              {isAdmin && <TableCell align="right">Update Status</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell component="th" scope="row">{booking.mission.mission_name}</TableCell>
                <TableCell>{booking.vehicle.name}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>

                {isAdmin && (
                  <TableCell align="right">
                    <Select 
                      value={booking.status} 
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BookingStatusPage;
