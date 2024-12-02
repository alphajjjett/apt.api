import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // ใช้เพื่อตรวจสอบว่าเป็น Admin หรือไม่
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Fetch all missions
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
    }

    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMissions(response.data);
      } catch (error) {
        setError('Failed to fetch missions');
      } finally {
        setLoading(false);
      }
    };

    // ตรวจสอบว่าเป็น Admin หรือไม่จาก Token
    const { role } = JSON.parse(atob(token.split('.')[1])); // decode JWT
    setIsAdmin(role === 'admin');

    fetchMissions();
  }, [navigate]);

  const handleDelete = async (missionId) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        await axios.delete(`http://localhost:5000/api/missions/${missionId}`, config);
        setMissions(missions.filter(mission => mission._id !== missionId));
        alert('Mission deleted successfully');
      } catch (error) {
        alert('Error deleting mission');
      }
    }
  };

  if (loading) return <p>Loading missions...</p>;

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
            <th>Start Date</th>
            <th>End Date</th>
            {isAdmin && <th>Action</th>} {/* แสดงปุ่ม Delete เฉพาะ Admin */}
          </tr>
        </thead>
        <tbody>
          {missions.map((mission) => (
            <tr key={mission._id}>
              <td>{mission.mission_name}</td>
              <td>{mission.description}</td>
              <td>{mission.status}</td>
              <td>{mission.assigned_vehicle_id ? mission.assigned_vehicle_id.license_plate : 'N/A'}</td>
              <td>{mission.assigned_user_id ? mission.assigned_user_id.name : 'N/A'}</td>
              <td>{new Date(mission.start_date).toLocaleDateString()}</td>
              <td>{new Date(mission.end_date).toLocaleDateString()}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => handleDelete(mission._id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default MissionList;
