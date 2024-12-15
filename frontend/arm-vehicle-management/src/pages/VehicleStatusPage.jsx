import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
    <div className="vehicle-status-container">
      <h2 className="vehicle-status-heading">Vehicle Status</h2>
      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card">
            <h3 className="vehicle-name">{vehicle.name}</h3>
            <p className="vehicle-info"><strong>Model:</strong> {vehicle.model}</p>
            <p className="vehicle-info"><strong>License Plate:</strong> {vehicle.license_plate}</p>
            <p className="vehicle-info"><strong>Status:</strong> {vehicle.status}</p>
            <p className="vehicle-info"><strong>Last Updated:</strong> {new Date(vehicle.updatedAt).toLocaleDateString()}</p>
            {isAdmin && (
              <div className="vehicle-status-update">
                <label className="vehicle-label">Update Status</label>
                <select
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                  className="vehicle-select"
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
      <button onClick={handleBackClick} className="back-button">
        Back to Dashboard
      </button>
    </div>
  );
};

export default VehicleStatusPage;
