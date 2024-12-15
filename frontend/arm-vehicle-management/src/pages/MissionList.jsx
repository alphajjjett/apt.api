import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // ตรวจสอบว่าเป็น Admin หรือไม่
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Mission List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.map((mission) => (
          <div key={mission._id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">{mission.mission_name}</h3>
            <p className="text-gray-700 mb-2">Description: {mission.description}</p>
            <p className="text-gray-700 mb-2">Status: {mission.status}</p>
            <p className="text-gray-700 mb-2">Vehicle: {mission.assigned_vehicle_id ? mission.assigned_vehicle_id.license_plate : 'N/A'}</p>
            <p className="text-gray-700 mb-2">Assigned User: {mission.assigned_user_id ? mission.assigned_user_id.name : 'N/A'}</p>
            <p className="text-gray-700 mb-2">Start Date: {new Date(mission.start_date).toLocaleDateString()}</p>
            <p className="text-gray-700 mb-2">End Date: {new Date(mission.end_date).toLocaleDateString()}</p>
            <p className="text-gray-500 text-sm mb-2">Last Updated: {new Date(mission.updatedAt).toLocaleDateString()}</p>
            {isAdmin && (
              <button
                onClick={() => handleDelete(mission._id)}
                className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleBackClick}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default MissionList;
