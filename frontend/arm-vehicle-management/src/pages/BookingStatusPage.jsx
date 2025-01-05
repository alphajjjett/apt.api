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
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Select } from '@mui/material';

const MySwal = withReactContent(Swal);

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

  const handleDeleteBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return setError('Please login to delete a booking');
    }

    const decodedToken = jwtDecode(token);
    const isAdmin = decodedToken.role === 'admin'; // Check if the logged-in user is an admin

    // Check if the logged-in user is an admin
    if (!isAdmin) {
      return MySwal.fire({
        title: "Unauthorized",
        text: "You must be an admin to delete a booking.",
        icon: "error"
      });
    }

    // Proceed with deletion
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
    <div className="container">
    {/* <div className="p-6 max-w-4xl mx-auto"> */}
      <h2 className="text-2xl font-semibold mb-6">Booking Status Page</h2>
      {error && <p className="text-red-500 mt-4">{error}</p>} 
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">Total Booking</h3>
            <p className="text-gray-600 text-2xl">{bookings.length}</p>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="booking status table">
          <TableHead>
            <TableRow>
              <TableCell>Mission Name</TableCell>
              <TableCell>Vehicle Name</TableCell>
              <TableCell >License Plate</TableCell>
              <TableCell >Booking Date</TableCell>
              <TableCell >Self ID</TableCell>
              <TableCell >User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Update</TableCell>
              {isAdmin && <TableCell >Update Status</TableCell>}
              {isAdmin && <TableCell >Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell component="th" scope="row">{booking.mission.mission_name}</TableCell>
                <TableCell>{booking.vehicle.name}</TableCell>
                <TableCell >{booking.vehicle.license_plate}</TableCell>
                <TableCell >{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                <TableCell >{booking.user.selfid}</TableCell>
                <TableCell >{booking.user.name}</TableCell>
                <TableCell >{booking.status}</TableCell>
                <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>

                {isAdmin && (
                  <TableCell >
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

                 {isAdmin && ( 
                    <TableCell>
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-full transition-colors"
                      >
                          Delete
                      </button>
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
