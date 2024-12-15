import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/MRequest.css'; // Import external CSS

const MissionRequest = () => {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions');
        setMissions(response.data);
      } catch (error) {
        setError('Failed to fetch missions');
      }
    };

    fetchMissions();
  }, []);

  const handleStatusChange = async (missionId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/missions/${missionId}/status`, {
        status: newStatus,
      });
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission._id === missionId ? { ...mission, status: newStatus } : mission
        )
      );
      alert('Mission status updated successfully');
    } catch (error) {
      setError('Failed to update mission status');
    }
  };

  return (
    <div className="container">
      <h2>Mission Requests</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="card-container">
        {missions.map((mission) => (
          <div key={mission._id} className="mission-card">
            <h3>{mission.mission_name}</h3>
            <p>{mission.description}</p>
            <p>Status: {mission.status}</p>
            <select
              value={mission.status}
              onChange={(e) => handleStatusChange(mission._id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}
      </div>

      <button onClick={handleBackClick}>Back to Dashboard</button>
    </div>
  );
};

export default MissionRequest;
