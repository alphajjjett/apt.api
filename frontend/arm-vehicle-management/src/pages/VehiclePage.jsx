import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState({
    name: '',
    license_plate: '',
    model: '',
    fuel_type: '',
    fuel_capacity: 80 // Default to 80 liters
  });

  useEffect(() => {
    // Fetch vehicles
    const fetchVehicles = async () => {
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(response.data);
    };
    fetchVehicles();

    // Check if the user is an admin (you should get this info from token)
    const token = localStorage.getItem('token');
    if (token) {
      const { role } = JSON.parse(atob(token.split('.')[1])); // decode JWT
      setIsAdmin(role === 'admin');
    }
  }, []);

  
  const handleBackClick = () => {
    navigate('/dashboard');  // นำทางกลับไปที่หน้า Dashboard
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target ;
    
    setVehicleData({ ...vehicleData, [name]: value }); 
    
    }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('http://localhost:5000/api/vehicles/create', vehicleData, config);
      alert('Vehicle created successfully');
    } catch (error) {
      alert('Error creating vehicle');
    }
  };

  

  return (
    <div>
      <h1>Vehicle Information</h1>
      <ul>
        {vehicles.map((vehicle) => (
          <li key={vehicle._id}>
            Model: {vehicle.model}, License Plate: {vehicle.license_plate}, Fuel Type: {vehicle.fuel_type}, Fuel Capacity: {vehicle.fuel_capacity} liters
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div>
          <h2>Create New Vehicle</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input
                type="text" 
                name="name"
                value={vehicleData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>License Plate:</label>
              <input
                type="text"
                name="license_plate"
                value={vehicleData.license_plate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Model:</label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Fuel Type:</label>
              <input
                type="text"
                name="fuel_type"
                value={vehicleData.fuel_type}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Fuel Capacity (liters):</label>
              <input
                type="number"
                name="fuel_capacity"
                value={vehicleData.fuel_capacity}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit">Create Vehicle</button>
          </form>
        </div>
      )}
      {/* ปุ่ม Back to Dashboard */}
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
        </button>
    </div>
  );
};

export default VehiclePage;
