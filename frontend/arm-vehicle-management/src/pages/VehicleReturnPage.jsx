import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

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

    const fetchVehicleReturns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicle-returns');
        setVehicleReturns(response.data);
      } catch (error) {
        setError('Error fetching vehicle returns');
      }
    };

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

  const handlePrint = () => {
    const printContent = document.getElementById('printContent').innerHTML;
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Vehicle Return Report</title></head><body>');
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
              />
            </div>

            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600">Submit</button>
          </form>

          <button onClick={handleBackClick} className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
            Back to Dashboard
          </button>
        </div>

        {/* Vehicle Returns Table Card */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center">Vehicle Returns</h2>

          <table className="w-full mt-4 table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-sm font-medium">Booking ID</th>
                <th className="px-4 py-2 text-sm font-medium">Vehicle</th>
                <th className="px-4 py-2 text-sm font-medium">User</th>
                <th className="px-4 py-2 text-sm font-medium">Return Date</th>
                <th className="px-4 py-2 text-sm font-medium">Condition</th>
                <th className="px-4 py-2 text-sm font-medium">Fuel Level</th>
                <th className="px-4 py-2 text-sm font-medium">Remark</th>
              </tr>
            </thead>
            <tbody>
              {vehicleReturns.map(vehicleReturn => {
                // หาข้อมูล booking ที่ตรงกับ booking_id ของ vehicleReturn
                const booking = bookings.find(booking => booking._id === vehicleReturn.booking_id._id);
                const missionName = booking ? booking.mission.mission_name : 'ไม่พบภารกิจ'; // ถ้าไม่พบจะให้ค่าเริ่มต้น

                return (
                  <tr key={vehicleReturn._id} className="border-t">
                    <td className="px-4 py-2">{missionName}</td> {/* แสดง mission_name */}
                    <td className="px-4 py-2">{vehicleReturn.vehicle_id.license_plate}</td>
                    <td className="px-4 py-2">{vehicleReturn.user_id.name}</td>
                    <td className="px-4 py-2">{new Date(vehicleReturn.return_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{vehicleReturn.condition}</td>
                    <td className="px-4 py-2">{vehicleReturn.fuel_level}</td>
                    <td className="px-4 py-2">{vehicleReturn.remark}</td>
                  </tr>
                );
              })}
            </tbody>

          </table>

          <div id="printContent" className="hidden">
            <table className="w-full mt-4 table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-sm font-medium">Booking ID</th>
                  <th className="px-4 py-2 text-sm font-medium">Vehicle</th>
                  <th className="px-4 py-2 text-sm font-medium">User</th>
                  <th className="px-4 py-2 text-sm font-medium">Return Date</th>
                  <th className="px-4 py-2 text-sm font-medium">Condition</th>
                  <th className="px-4 py-2 text-sm font-medium">Fuel Level</th>
                  <th className="px-4 py-2 text-sm font-medium">Remark</th>
                </tr>
              </thead>
              <tbody>
                {vehicleReturns.map(vehicleReturn => (
                  <tr key={vehicleReturn._id}>
                    <td className="px-4 py-2">{vehicleReturn.booking_id._id}</td>
                    <td className="px-4 py-2">{vehicleReturn.vehicle_id.license_plate}</td>
                    <td className="px-4 py-2">{vehicleReturn.user_id.name}</td>
                    <td className="px-4 py-2">{new Date(vehicleReturn.return_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{vehicleReturn.condition}</td>
                    <td className="px-4 py-2">{vehicleReturn.fuel_level}</td>
                    <td className="px-4 py-2">{vehicleReturn.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handlePrint} className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleReturnPage;
