import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const MySwal = withReactContent(Swal);

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [updatedVehicle, setUpdatedVehicle] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
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
    const { role } = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(role === 'admin');
    fetchVehicles();
  }, [navigate]);

  const handleDelete = async (vehicleId) => {
    const token = localStorage.getItem('token');
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleId));
          MySwal.fire('Deleted!', 'The vehicle has been deleted.', 'success');
        } catch (error) {
          MySwal.fire('Error', 'There was an error deleting the vehicle.', 'error');
        }
      }
    });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setUpdatedVehicle({
      name: vehicle.name,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setUpdatedVehicle({ ...updatedVehicle, [name]: value });
  };

  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/vehicles/${selectedVehicle._id}`, updatedVehicle, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(vehicles.map((vehicle) =>
        vehicle._id === selectedVehicle._id ? { ...vehicle, ...updatedVehicle } : vehicle
      ));
      MySwal.fire('Updated!', 'The vehicle has been updated.', 'success');
      setEditDialogOpen(false);
    } catch (error) {
      MySwal.fire('Error', 'There was an error updating the vehicle.', 'error');
    }
  };

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2>Vehicle List</h2>
      {/* Search box */}
      <TextField
        label="Search by ทะเบียนรถ"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="vehicle table">
          <TableHead>
            <TableRow>
              <TableCell>Vehicle Name</TableCell>
              <TableCell align="left">Model</TableCell>
              <TableCell align="left">License Plate</TableCell>
              <TableCell align="left">Fuel Type</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Description</TableCell>
              {(isAdmin) && (
              <TableCell align="left">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell component="th" scope="row">
                  {vehicle.name}
                </TableCell>
                <TableCell align="left">{vehicle.model}</TableCell>
                <TableCell align="left">{vehicle.license_plate}</TableCell>
                <TableCell align="left">{vehicle.fuel_type}</TableCell>
                <TableCell align="left">{vehicle.status}</TableCell>
                <TableCell align="left">{vehicle.description}</TableCell>
                {(isAdmin) && (
                <TableCell align="left">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(vehicle)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      {(isAdmin)&&(
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Vehicle</DialogTitle>
        <DialogContent>
          <TextField
            label="Vehicle Name"
            variant="outlined"
            fullWidth
            name="name"
            value={updatedVehicle.name || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Model"
            variant="outlined"
            fullWidth
            name="model"
            value={updatedVehicle.model || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px' }}
          />
          {/* <TextField
            label="License Plate"
            variant="outlined"
            fullWidth
            name="license_plate"
            value={updatedVehicle.license_plate || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px' }}
          /> */}
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            name="description"
            value={updatedVehicle.description || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEdit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      )}
    </div>
  );
};

export default VehicleList;
