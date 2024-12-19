import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateMission.css';  // Import external CSS

const CreateMission = () => {
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [status] = useState('pending');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === 'admin') {
        navigate('/mission_request');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles');
        // Filter out vehicles that are not 'Available'
        const availableVehicles = response.data.filter(vehicle => vehicle.status === 'available');
        setVehicles(availableVehicles);
      } catch (error) {
        setError('Failed to fetch vehicles');
      }
    };
    fetchVehicles();
  }, []);

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
        assigned_vehicle_id: selectedVehicle,
        assigned_user_id: userId,
        start_date: startDate,
        end_date: endDate,
      };

      await axios.post('http://localhost:5000/api/missions', missionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Mission created successfully');
    } catch (error) {
      console.error('Error creating mission:', error);
      setError('Failed to create mission');
    }
  };

  return (
    <div className="create-mission-container">
      <h2 className="create-mission-heading">Create Mission</h2>
      {error && <p className="create-mission-error">{error}</p>}
      <form onSubmit={handleSubmit} className="create-mission-form">
        <div>
          <label className="create-mission-label">Mission Name:</label>
          <input
            type="text"
            value={missionName}
            onChange={(e) => setMissionName(e.target.value)}
            required
            className="create-mission-input"
          />
        </div>
        <div>
          <label className="create-mission-label">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="create-mission-textarea"
          />
        </div>
        <div>
          <label className="create-mission-label">Assigned Vehicle:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
            className="create-mission-select"
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.name} ({vehicle.license_plate})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="create-mission-label">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="create-mission-input"
          />
        </div>
        <div>
          <label className="create-mission-label">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="create-mission-input"
          />
        </div>
        <button type="submit" className="create-mission-button">
          Create Mission
        </button>
      </form>
    </div>
  );
};

export default CreateMission;
