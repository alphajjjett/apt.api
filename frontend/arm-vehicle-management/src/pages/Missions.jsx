import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const MySwal = withReactContent(Swal);

const CreateMission = () => {
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [status] = useState('pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setLoggedUser(decodedToken);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles');
        const availableVehicles = response.data.filter(vehicle => vehicle.status === 'available');
        setVehicles(availableVehicles);
      } catch (error) {
        setError('Failed to fetch vehicles');
      }
    };
    fetchVehicles();
  }, []);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please log in.');
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const missionData = {
        mission_name: missionName,
        description,
        status,
        assigned_user_id: userId,
        assigned_vehicle_id: selectedVehicle,
        start_date: startDate,
        end_date: endDate,
      };

      await axios.post('http://localhost:5000/api/missions', missionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      MySwal.fire({
        icon: 'success',
        title: 'Mission created successfully',
        text: 'Your mission has been created successfully.',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/missionslist');
      });

    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an issue creating your mission.',
        confirmButtonText: 'Try Again'
      });
    }
  };

  return (
    <div className="container min-h-screen w-full p-6 items-center justify-center">
      <div className=" max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg font-noto">
        <h2 className="text-2xl font-bold text-center mb-4">สร้างข้อมูลการจอง</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">ภารกิจ:</label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              required
              className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">รายละเอียดภารกิจ:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {loggedUser && (
            <div>
              <label className="block text-lg font-medium text-gray-700">ชื่อผู้จอง:</label>
              <input
                type="text"
                value={loggedUser.name}
                readOnly
                className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-lg font-medium text-gray-700">วันที่จอง:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">วันที่คืน:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">ยี่ห้อรถ:</label>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full border border-gray-300 p-2 rounded-md"
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
              <Modal.Title>เลือกรถ</Modal.Title>
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
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
              >
                Close
              </button>
            </Modal.Footer>
          </Modal>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            สร้างการจอง
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateMission;
