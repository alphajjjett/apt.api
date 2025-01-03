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

const VehicleReturnPage = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicleReturns, setVehicleReturns] = useState([]);
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
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings');
      setBookings(response.data);
    } catch (error) {
      setError('Error fetching bookings');
    }
  };

  const fetchVehicleReturns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vehicle-returns');
      setVehicleReturns(response.data);
    } catch (error) {
      setError('Error fetching vehicle returns');
    }
  };

  // Check if the user is an admin
  const token = localStorage.getItem('token');
  if (token) {
    const decodedToken = jwtDecode(token);
    setIsAdmin(decodedToken.role === 'admin');
  }

  fetchBookings();
  fetchVehicleReturns();
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


  const handleDeleteVehicleReturn = async (vehicleReturnId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return setError('Please login to delete a vehicle return');
    }

    const decodedToken = jwtDecode(token);
    const isAdmin = decodedToken.role === 'admin'; // Check if the logged-in user is an admin

    // Check if the logged-in user is an admin
    if (!isAdmin) {
      return MySwal.fire({
        title: "Unauthorized",
        text: "You must be an admin to delete a vehicle return.",
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
          // Change the API endpoint to delete a vehicle return
          await axios.delete(`http://localhost:5000/api/vehicle-returns/${vehicleReturnId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Remove the deleted vehicle return from the list (update state accordingly)
          setVehicleReturns(vehicleReturns.filter(returnItem => returnItem._id !== vehicleReturnId));

          MySwal.fire({
            title: "Deleted!",
            text: "The vehicle return has been deleted.",
            icon: "success"
          });
        } catch (error) {
          setError('Failed to delete vehicle return');
          MySwal.fire({
            title: "Error",
            text: "There was an error deleting the vehicle return.",
            icon: "error"
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancelled",
          text: "Your vehicle return is safe :)",
          icon: "error"
        });
      }
    });
};

  

  const handlePrint = (vehicleReturn) => {
    const booking = bookings.find(booking => booking._id === vehicleReturn.booking_id._id);
    const missionName = booking ? booking.mission.mission_name : 'ไม่พบภารกิจ';
  
    const printContent = `
      <div class="w-full p-6 bg-white shadow-lg rounded-lg overflow-hidden">
        <h2 class="text-xl font-bold mb-4">Vehicle Return Report</h2>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">Mission Name:</p>
          <p class="text-sm text-gray-800">${missionName}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">Vehicle License Plate:</p>
          <p class="text-sm text-gray-800">${vehicleReturn.vehicle_id.license_plate}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">User:</p>
          <p class="text-sm text-gray-800">${vehicleReturn.user_id.name}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">Return Date:</p>
          <p class="text-sm text-gray-800">${new Date(vehicleReturn.return_date).toLocaleDateString()}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">Condition:</p>
          <p class="text-sm text-gray-800">${vehicleReturn.condition}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">Fuel Level:</p>
          <p class="text-sm text-gray-800">${vehicleReturn.fuel_level}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-600">Remark:</p>
          <p class="text-sm text-gray-800">${vehicleReturn.remark}</p>
        </div>
  
        <!-- ช่องลายเซ็นของ User -->
        <div class="mt-8">
         <p class="text-sm font-medium text-gray-600">ลงชื่อ:</p> 
          <div class="border-t border-gray-400 w-64 mt-4"></div>
          <p class="text-sm text-gray-800 mt-2">${vehicleReturn.user_id.name}</p>
        </div>
        <br/>

        <!-- ช่องลายเซ็นของหัวหน้าธุรการ -->
        <div class="mt-8">
          <p class="text-sm font-medium text-gray-600">ลงชื่อ:</p>
          <div class="border-t border-gray-400 w-64 mt-4"></div>
          <p class="text-sm text-gray-800 mt-2">หัวหน้าธุรการ กรว.5</p>
        </div>
      </div>
    `;
  
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Vehicle Return Report</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">'); // ลิงก์ไปที่ Tailwind CSS CDN
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };
  
  
  return (
    <div className="p-6">
      <div className="w-full max-w-3xl mx-auto">
        {/* Form Card */}
        <div className="p-6 bg-white rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-center">Vehicle Return Management</h2>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {success && <p className="text-green-500 text-center mt-4">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="booking_id" className="block text-sm font-medium">Booking (Mission):</label>
              <select 
                name="booking_id"
                value={formData.booking_id}
                onChange={handleBookingChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Mission</option>
                {bookings.map(booking => (
                  <option key={booking._id} value={booking._id}>
                    {booking.mission.mission_name} - {booking.vehicle.license_plate}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="vehicle_id" className="block text-sm font-medium">Vehicle:</label>
              <input
                type="text"
                id="vehicle_id"
                value={vehicleDisplay}
                readOnly
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="user_id" className="block text-sm font-medium">User:</label>
              <input
                type="text"
                id="user_id"
                value={userDisplay}
                readOnly
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="return_date" className="block text-sm font-medium">Return Date:</label>
              <input
                type="date"
                id="return_date"
                name="return_date"
                value={formData.return_date}
                onChange={handleInputChange}
                readOnly
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="condition" className="block text-sm font-medium">Condition:</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Condition</option>
                <option value="good">Good</option>
                <option value="damaged">Damaged</option>
                <option value="needs repair">Needs Repair</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="fuel_level" className="block text-sm font-medium">Fuel Level:</label>
              <input
                type="number"
                id="fuel_level"
                name="fuel_level"
                value={formData.fuel_level}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="remark" className="block text-sm font-medium">Remark:</label>
              <input
                type="text"
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                required
              />
              
            </div>

            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600">Submit</button>
          </form>
        </div>

        {/* Vehicle Returns Table Card */}
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold text-center">Vehicle Returns</h2>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <TableContainer component={Paper} className="mt-4">
        <Table sx={{ minWidth: 650 }} aria-label="vehicle returns table">
          <TableHead>
            <TableRow>
              <TableCell>Mission Name</TableCell>
              <TableCell>Vehicle License Plate</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Return Date</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Fuel Level</TableCell>
              <TableCell>Remark</TableCell>
              <TableCell>Actions</TableCell>
              {isAdmin && <TableCell align="right">Delete</TableCell>} 
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicleReturns.map(vehicleReturn => {
              const booking = bookings.find(booking => booking._id === vehicleReturn.booking_id._id);
              const missionName = booking ? booking.mission.mission_name : 'ไม่พบภารกิจ';

              return (
                <TableRow key={vehicleReturn._id}>
                  <TableCell>{missionName}</TableCell>
                  <TableCell>{vehicleReturn.vehicle_id.license_plate}</TableCell>
                  <TableCell>{vehicleReturn.user_id.name}</TableCell>
                  <TableCell>{new Date(vehicleReturn.return_date).toLocaleDateString()}</TableCell>
                  <TableCell>{vehicleReturn.condition}</TableCell>
                  <TableCell>{vehicleReturn.fuel_level}</TableCell>
                  <TableCell>{vehicleReturn.remark}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handlePrint(vehicleReturn)}
                      className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    >
                      Print Report
                    </button>
                  </TableCell>
                  {isAdmin && (  
                    <TableCell align="right">
                      <button
                        onClick={() => handleDeleteVehicleReturn(vehicleReturn._id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </TableCell>
                  )}
                    </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>

      </div>
    </div>
  );
};

export default VehicleReturnPage;
