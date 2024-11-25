import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';  // Remove curly braces from jwtDecode
import { useNavigate } from 'react-router-dom';  // Add navigate functionality

const CreateMission = () => {
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [status] = useState('pending'); // ตั้งค่าเป็น 'pending' โดยไม่ต้องให้ผู้ใช้เลือก
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Initialize navigate

  // Check user's role and redirect if admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      // If the user is an admin, redirect them to another page
      if (userRole === 'admin') {
        navigate('/mission-request');  // Redirect to MissionRequest page for admins
      }
    }
  }, [navigate]);  // Dependency array includes navigate

  // Fetch vehicles for dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles');
        setVehicles(response.data);
      } catch (error) {
        setError('Failed to fetch vehicles');
      }
    };
    fetchVehicles();
  }, []);

  // Handle form submission
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
        status,  // ใช้ค่า status ที่ได้จากการเลือกในฟอร์ม
        assigned_vehicle_id: selectedVehicle,
        assigned_user_id: userId,
        start_date: startDate,  // ใช้วันที่เริ่มต้นจากฟอร์ม
        end_date: endDate,      // ใช้วันที่สิ้นสุดจากฟอร์ม
      };
  
      await axios.post('http://localhost:5000/api/missions', missionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert('Mission created successfully');
    } catch (error) {
      console.error('Error creating mission:', error); // แสดงข้อผิดพลาดใน console
      setError('Failed to create mission');
    }
  };
  

  return (
    <div>
      <h2>Create Mission</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mission Name:</label>
          <input
            type="text"
            value={missionName}
            onChange={(e) => setMissionName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Assigned Vehicle:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.license_plate} {/* หรือใช้ model ถ้าต้องการแสดงรุ่น */}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Mission</button>
      </form>
    </div>
  );
};

export default CreateMission;
