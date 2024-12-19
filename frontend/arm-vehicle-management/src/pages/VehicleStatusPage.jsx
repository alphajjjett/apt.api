import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const VehicleStatusPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
          headers: { Authorization: `Bearer ${token}` },
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="vehicle status table">
          <TableHead>
            <TableRow>
              <TableCell>Vehicle Name</TableCell>
              <TableCell align="right">Model</TableCell>
              <TableCell align="right">License Plate</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Last Updated</TableCell>
              {isAdmin && <TableCell align="right">Update Status</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell component="th" scope="row">
                  {vehicle.name}
                </TableCell>
                <TableCell align="right">{vehicle.model}</TableCell>
                <TableCell align="right">{vehicle.license_plate}</TableCell>
                <TableCell align="right">{vehicle.status}</TableCell>
                <TableCell align="right">
                  {new Date(vehicle.updatedAt).toLocaleDateString()}
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <Select
                      value={vehicle.status}
                      onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="in-use">In Use</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default VehicleStatusPage;
