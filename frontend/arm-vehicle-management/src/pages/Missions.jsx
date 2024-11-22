import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const CreateMission = () => {
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [error, setError] = useState(null);

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
      const decodedToken = jwtDecode(token); // decode token to get user ID
      const userId = decodedToken.id;

      const missionData = {
        mission_name: missionName,
        description,
        status,
        assigned_vehicle_id: selectedVehicle,
        assigned_user_id: userId,
      };

      await axios.post('http://localhost:5000/api/missions', missionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Mission created successfully');
    } catch (error) {
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
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label>Assigned Vehicle:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.license_plate}  {/* หรือใช้ model ถ้าต้องการแสดงรุ่น */}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Create Mission</button>
      </form>
    </div>
  );
};

export default CreateMission;
