import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import '../styles/VehicleStatus.css';  // Import the external CSS

const VehicleStatusPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'admin');
    } catch (err) {
      setError('Failed to decode token');
    }

    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(response.data);
      } catch (error) {
        setError('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleStatusChange = async (vehicleId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/vehicles/${vehicleId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle._id === vehicleId ? { ...vehicle, status: newStatus } : vehicle
        )
      );
    } catch (error) {
      setError('Failed to update vehicle status');
    }
  };

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Vehicle Status</h2>

      <div className="vehicle-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card p-4 bg-white border border-gray-300 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{vehicle.name}</h3>
            <p className="vehicle-info"><strong>Model:</strong> {vehicle.model}</p>
            <p className="vehicle-info"><strong>License Plate:</strong> {vehicle.license_plate}</p>
            <p className="vehicle-info"><strong>Status:</strong> {vehicle.status}</p>
            <p className="vehicle-info"><strong>Last Updated:</strong> {new Date(vehicle.updatedAt).toLocaleDateString()}</p>

            {isAdmin && (
              <div className="mt-4">
                <label className="block mb-2 font-medium">Update Status</label>
                <select
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={handleBackClick} 
        className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default VehicleStatusPage;
