import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions');
        setMissions(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMissions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMission = { mission_name: missionName, description, assigned_vehicle_id: vehicleId, assigned_user_id: userId };
      const response = await axios.post('http://localhost:5000/api/missions', newMission);
      setMissions([...missions, response.data]);
      setMissionName('');
      setDescription('');
      setVehicleId('');
      setUserId('');
      setError(null);
    } catch (err) {
      setError('Error adding mission');
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Missions</h2>
      
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Mission Name" value={missionName} onChange={(e) => setMissionName(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="text" placeholder="Vehicle ID" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required />
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <button type="submit">Add Mission</button>
      </form>

      {error && <p>{error}</p>}

      <ul>
        {missions.map((mission) => (
          <li key={mission._id}>
            <h3>{mission.mission_name}</h3>
            <p>{mission.description}</p>
            <p>Status: {mission.status}</p>
            <p>Assigned Vehicle: {mission.assigned_vehicle_id?.name || 'N/A'}</p>
            <p>Assigned User: {mission.assigned_user_id?.name || 'N/A'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Missions;
