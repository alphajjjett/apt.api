import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MissionRequest = () => {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState(null);

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
      // Update the local state to reflect the new status
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
    <div>
      <h2>Mission Requests</h2>
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Mission Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((mission) => (
            <tr key={mission._id}>
              <td>{mission.mission_name}</td>
              <td>{mission.description}</td>
              <td>{mission.status}</td>
              <td>
                <select
                  value={mission.status}
                  onChange={(e) => handleStatusChange(mission._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MissionRequest;
