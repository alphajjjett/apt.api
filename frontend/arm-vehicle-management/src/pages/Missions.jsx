import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';
import theme from "../css/theme";

registerLocale('th', th);

const MySwal = withReactContent(Swal);

const CreateMission = () => {
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status] = useState('waiting');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const navigate = useNavigate();
  const backend = process.env.REACT_APP_API_URL;

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
        const response = await axios.get(`${backend}/api/vehicles`);
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
        quantity,
        status,
        assigned_user_id: userId,
        assigned_vehicle_id: selectedVehicle,
        start_date: startDate,
        end_date: endDate,
      };

      await axios.post(`${backend}/api/missions`, missionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      MySwal.fire({
        icon: 'success',
        title: 'จองรถสำเร็จ!',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/missionslist');
      });

    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'รถถูกจองแล้ว!',
        text: 'กรุณาเปลี่ยนรถในการใช้งาน'
      });
    }
  };

  return ( 
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-noto">
      <div className="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          สร้างข้อมูลการจอง 🚗
        </h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ชื่อภารกิจ */}
          <div>
            <label className="block text-lg font-semibold text-gray-700">ภารกิจ:</label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-lg font-semibold text-gray-700">รายละเอียดภารกิจ:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* จำนวนคนที่ไป */}
          <div>
            <label className="block text-lg font-semibold text-gray-700">จำนวนคนที่ไป:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* วันที่ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold text-gray-700">วันที่จอง:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="d MMMM yyyy"
                locale="th"
                placeholderText="เลือกวันที่"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700">วันที่คืน:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="d MMMM yyyy"
                locale="th"
                placeholderText="เลือกวันที่"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
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
            <Modal.Header closeButton className="font-noto">
              <Modal.Title>เลือกรถ</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="border border-gray-300 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg font-noto"
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
