import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate('/dashboard');  // นำทางกลับไปที่หน้า Dashboard
  };

  // Fetch all missions
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });  // ถ้าไม่มี token ให้ redirect ไปที่หน้า login
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

    fetchMissions();
  }, [navigate]);

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
            <th>Start Date</th>  {/* เพิ่มคอลัมน์ start date */}
            <th>End Date</th>    {/* เพิ่มคอลัมน์ end date */}
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
              <td>{new Date(mission.start_date).toLocaleDateString()}</td>  {/* แสดง start date */}
              <td>{new Date(mission.end_date).toLocaleDateString()}</td>    {/* แสดง end date */}
            </tr>
          ))}
        </tbody>
      </table>
      {/* ปุ่ม Back to Dashboard */}
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>
      
    </div>
  );
};

export default MissionList;
