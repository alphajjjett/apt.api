import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all missions
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMissions(response.data);
      } catch (error) {
        setError('Failed to fetch missions');
      }
    };
    fetchMissions();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (missions.length === 0) {
    return <p>No missions available</p>;
  }

  return (
    <div>
      <h2>Mission List</h2>
      <table>
        <thead>
          <tr>
            <th>Mission Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Vehicle</th>
            <th>Assigned User</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((mission) => (
            <tr key={mission._id}>
              <td>{mission.mission_name}</td>
              <td>{mission.description}</td>
              <td>{mission.status}</td>
              <td>{mission.assigned_vehicle_id.license_plate}</td>
              <td>{mission.assigned_user_id.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MissionList;
