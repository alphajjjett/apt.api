import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// import '../styles/CreateMission.css'; 

const MySwal = withReactContent(Swal);

const CreateMission = () => {
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [status] = useState('pending');
  // const [vehicles, setVehicles] = useState([]);
  // const [users, setUsers] = useState([]);
  // const [selectedVehicle, setSelectedVehicle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setLoggedUser(decodedToken);
      if (decodedToken.role === 'admin') {
        navigate('/mission_request');
      }
    }
  }, [navigate]);

  // useEffect(() => {
  //   const fetchVehicles = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:5000/api/vehicles');
  //       const availableVehicles = response.data.filter(vehicle => vehicle.status === 'available');
  //       setVehicles(availableVehicles);
  //     } catch (error) {
  //       setError('Failed to fetch vehicles');
  //     }
  //   };
  //   fetchVehicles();
    
  // }, []);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:5000/api/users');
  //       const allUsers = response.data;  
  //       setUsers(allUsers);
  //     } catch (error) {
  //       setError('Failed to fetch users');
  //     }
  //   };
  //   fetchUsers();
  // }, []); 
  

 

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
        // assigned_vehicle_id: selectedVehicle,
        assigned_user_id: userId,
        start_date: startDate,
        end_date: endDate,
      };

      await axios.post('http://localhost:5000/api/missions', missionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/booking`, { replace: true });
      MySwal.fire({
        icon: 'success',
        title: 'Mission created successfully',
        text: 'Your mission has been created successfully.',
        confirmButtonText: 'OK'
      });
      
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an issue updating your profile.',
        confirmButtonText: 'Try Again'
      });
      setError('Failed to create mission');
    }
  };

  return (
    <div className="container">
  <h2>Create Mission</h2>
  {error && <p className="text-red-600 text-center mb-4">{error}</p>}
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
      <label className="block text-lg font-medium text-gray-700">Mission Name:</label>
      <input
        type="text"
        value={missionName}
        onChange={(e) => setMissionName(e.target.value)}
        required
        className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label className="block text-lg font-medium text-gray-700">Description:</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    {loggedUser && (
      <div>
        <label className="block text-lg font-medium text-gray-700">Assigned User:</label>
        <input
          type="text"
          value={loggedUser.name} // แสดงชื่อผู้ใช้จาก token
          readOnly
          className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    )}

    <div>
      <label className="block text-lg font-medium text-gray-700">Start Date:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
        className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label className="block text-lg font-medium text-gray-700">End Date:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
        className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <button
      type="submit"
      className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Create Mission
    </button>
  </form>
</div>

  );
};

export default CreateMission;
