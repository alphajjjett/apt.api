import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Modal } from 'react-bootstrap';

const MySwal = withReactContent(Swal);

const BookingPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMission, setSelectedMission] = useState(''); // mission ที่ถูกเลือก
  const [selectedVehicle, setSelectedVehicle] = useState(''); // vehicle ที่ถูกเลือก
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setShowModal(false);
  };


  // useEffect สำหรับการดึงข้อมูลทั้งหมด
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
        // ดึง Mission ล่าสุดมาใส่ใน selectedMission
        const latestMissionRes = await axios.get('http://localhost:5000/api/missions/latest');
        if (latestMissionRes.data) {
          setSelectedMission(latestMissionRes.data._id); // ตั้งค่า mission ล่าสุดใน selectedMission
        }
      } catch (error) {
        setError('Error fetching data');
      }
    };

    fetchData();
  }, [bookings]);

  const handleCreateBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return setError('Please login to create a booking');
    }
  
    const userId = jwtDecode(token).id;
  
    try {
      const newBooking = {
        missionId: selectedMission, // ใช้ mission ที่ถูกเลือก (หรืออัตโนมัติจาก mission ล่าสุด)
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
      // Using SweetAlert2 for success notification
      MySwal.fire({
        title: 'Booking Completed!',
        text: 'Your booking has been successfully created.',
        icon: 'success',
        confirmButtonText: 'Okay',
      });
    } catch (error) {
      setError('Failed to create Booking!');
      // Using SweetAlert2 for error notification
      MySwal.fire({
        title: 'Error!',
        text: 'Failed to create booking. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    }
  };

  return (
    <div className="container">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-wrap lg:flex-row gap-8">
        {/* Create Booking Section */}
        {!isAdmin && (
          <div className="lg:w-1/3">
            <h2>Booking Page</h2>
            <div className="border border-gray-300 p-6 rounded-lg shadow-md bg-white">
              <div className="mb-4">
                <label className="block mb-2 font-bold">Mission:</label>
                {missions.length > 0 ? (
                  <p className="w-full border border-gray-300 p-2 rounded">
                    {missions.find((mission) => mission._id === selectedMission)?.mission_name || 'No mission selected'}
                  </p>
                ) : (
                  <p className="w-full border border-gray-300 p-2 rounded">No missions available</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-bold">Description:</label>
                {missions.length > 0 ? (
                  <p className="w-full border border-gray-300 p-2 rounded">
                    {missions.find((mission) => mission._id === selectedMission)?.description || 'No description available'}
                  </p>
                ) : (
                  <p className="w-full border border-gray-300 p-2 rounded">No missions available</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold">User:</label>
                {missions.length > 0 ? (
                  <p className="w-full border border-gray-300 p-2 rounded">
                    {
                      missions.find((mission) => mission._id === selectedMission)?.assigned_user_id?.name || 'No user assigned'
                    }
                  </p>
                ) : (
                  <p className="w-full border border-gray-300 p-2 rounded">No missions available</p>
                )}
              </div>


              
              <div className="mb-4">
                <label className="block mb-2 font-bold">Booking Date</label>
                <p className="w-full border border-gray-300 p-2 rounded">
                  {selectedMission
                    ? new Date(missions.find((mission) => mission._id === selectedMission)?.start_date).toLocaleDateString()
                    : 'No mission selected'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold">Vehicle:</label>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  {selectedVehicle
                    ? `${vehicles.find((vehicle) => vehicle._id === selectedVehicle).name} 
                      (${vehicles.find((vehicle) => vehicle._id === selectedVehicle).license_plate})`
                    : 'เลือกรถ'}
                </button>
              </div>


              {/* Modal for vehicle selection */}
              <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>Select a Vehicle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="border border-gray-300 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                        onClick={() => handleVehicleSelect(vehicle._id)}
                      >
                        <div className="font-bold text-lg">{vehicle.name}</div>
                        <div className="text-sm text-gray-500">รุ่น: {vehicle.model}</div>
                        <div className="text-sm text-gray-500">ทะเบียน: {vehicle.license_plate}</div>
                        
                        <div className="text-sm text-gray-500">เชื้อเพลิง: {vehicle.fuel_type}</div>
                      </div>
                    ))}
                  </div>
                </Modal.Body>
                  <Modal.Footer>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-500 text-white py-2 px-4 rounded"
                    >
                      Close
                    </button>
                  </Modal.Footer>
              </Modal>


              <button onClick={handleCreateBooking} className="bg-green-500 text-white py-2 px-4 rounded w-full">
                Create Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
