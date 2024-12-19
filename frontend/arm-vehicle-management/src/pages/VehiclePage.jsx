import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    name: '',
    license_plate: '',
    model: '',
    fuel_type: '',
    fuel_capacity: 80
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(response.data);
    };
    fetchVehicles();

    const token = localStorage.getItem('token');
    if (token) {
      const { role } = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(role === 'admin');
    }
  }, []);

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
        setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));
        alert('Vehicle deleted successfully');
      } catch (error) {
        alert('Error deleting vehicle');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Vehicle Information Table */}
      <TableContainer component={Paper} className="mb-6">
        <Table sx={{ minWidth: 650 }} aria-label="vehicle table">
          <TableHead>
            <TableRow>
              <TableCell>Vehicle Name</TableCell>
              <TableCell>License Plate</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Fuel Type</TableCell>
              <TableCell>Fuel Capacity (liters)</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell component="th" scope="row">
                  {vehicle.name}
                </TableCell>
                <TableCell>{vehicle.license_plate}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.fuel_type}</TableCell>
                <TableCell>{vehicle.fuel_capacity} liters</TableCell>
                {isAdmin && (
                  <TableCell>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create New Vehicle Form */}
      {isAdmin && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
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
    </div>
  );
};

export default VehiclePage;
