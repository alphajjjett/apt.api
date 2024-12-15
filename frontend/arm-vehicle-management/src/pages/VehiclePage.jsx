import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Vehicle.css'; // Import external CSS

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
    const { name, value } = e.target;
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

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}`, config);
        setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));  // Remove vehicle from state
        alert('Vehicle deleted successfully');
      } catch (error) {
        alert('Error deleting vehicle');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Vehicle Information</h1>
      
      <ul className="list-none p-0">
        {vehicles.map((vehicle) => (
          <li key={vehicle._id} className="max-w-md mx-auto mb-4 p-6 bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-semibold">Name: {vehicle.name}</p>
              <p className="text-sm text-gray-500">Model: {vehicle.model}</p>
              <p className="text-sm text-gray-500">License Plate: {vehicle.license_plate}</p>
              <p className="text-sm text-gray-500">Fuel Type: {vehicle.fuel_type}</p>
              <p className="text-sm text-gray-500">Fuel Capacity: {vehicle.fuel_capacity} liters</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => handleDelete(vehicle._id)} 
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </li>
        
        ))}
      </ul>

        {isAdmin && (
        <div className="mt-8 max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Create New Vehicle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name:</label>
              <input
                type="text"
                name="name"
                value={vehicleData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">License Plate:</label>
              <input
                type="text"
                name="license_plate"
                value={vehicleData.license_plate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model:</label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuel Type:</label>
              <input
                type="text"
                name="fuel_type"
                value={vehicleData.fuel_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuel Capacity (liters):</label>
              <input
                type="number"
                name="fuel_capacity"
                value={vehicleData.fuel_capacity}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-700"
            >
              Create Vehicle
            </button>
          </form>
        </div>
      )}

      
      {/* Back to Dashboard Button */}
      <button 
        onClick={handleBackClick} 
        className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default VehiclePage;
