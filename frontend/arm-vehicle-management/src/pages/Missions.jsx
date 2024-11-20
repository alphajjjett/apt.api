import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Missions = () => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMissions(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMissions();
  }, []);

  return (
    <div>
      <h2>Missions</h2>
      <table>
        <thead>
          <tr>
            <th>Mission Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Assigned Vehicle</th>
            <th>Assigned User</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((mission) => (
            <tr key={mission._id}>
              <td>{mission.mission_name}</td>
              <td>{mission.description}</td>
              <td>{mission.status}</td>
              <td>{mission.assigned_vehicle_id}</td>
              <td>{mission.assigned_user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Missions;
