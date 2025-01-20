import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {Table,TableBody,TableCell,TableContainer,TableHead,
        TableRow,Paper,Select,MenuItem,Button,TextField,Dialog,
        DialogActions,DialogContent,DialogTitle} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
      fuel_type: vehicle.fuel_type,
      // description: vehicle.description,
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
  
      // แสดงการแจ้งเตือนสำเร็จ
      Swal.fire({
        title: 'Success',
        text: `Vehicle status updated to ${newStatus} successfully.`,
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      setError('Failed to update vehicle status');
  
      // แสดงการแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        title: 'Error',
        text: 'There was an issue updating the vehicle status.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    }
  };
  

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลรถ</h2>
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">จำนวนรถ</h3>
          <p className="text-gray-600 text-2xl">{filteredVehicles.length} คัน</p>
        </div>
      </div>

      {/* Search box */}
      <TextField
        label="ค้นหา โดย เลขทะเบียนรถ"
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
              <TableCell>ยี่ห้อรถ</TableCell>
              <TableCell align="left">รุ่น</TableCell>
              <TableCell align="left">เลขทะเบียนรถ</TableCell>
              <TableCell align="left">ประเภทเชื้อเพลง</TableCell>
              <TableCell align="left">สถานะ</TableCell>
              {/* <TableCell align="left">Description</TableCell> */}
              {(isAdmin) && (
              <TableCell align="left">เปลี่ยนสถานะ</TableCell>
              )}
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
                {/* <TableCell align="left">{vehicle.status}</TableCell> */}

                <TableCell align="left">
                                    {vehicle.status === 'maintenance' ? (
                                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                                        ซ่อมบำรุง
                                      </span>
                                    ) : vehicle.status === 'in-use' ? (
                                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-orange-400 text-orange-400">
                                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-orange-400"></span>
                                        อยู่ระหว่างการใช้งาน
                                      </span>
                                    ) : vehicle.status === 'available' ? (
                                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                                        พร้อมใช้งาน
                                      </span>
                                    ) : null}
                              </TableCell>
                {/* <TableCell align="left">{vehicle.description}</TableCell> */}
                {(isAdmin) && (
                  <>
                    <TableCell align="left">
                      <Select
                        value={vehicle.status}
                        onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                      >
                        <MenuItem value="available">พร้อมใช้งาน</MenuItem>
                        <MenuItem value="in-use">อยู่ระหว่างการใช้งาน</MenuItem>
                        <MenuItem value="maintenance">ซ่อมบำรุง</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="left">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditClick(vehicle)}
                        style={{ marginRight: '10px' }}
                      >
                        <EditIcon/>แก้ไขข้อมูลรถ
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(vehicle._id)}
                      >
                        <DeleteIcon/>ลบข้อมูล
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      {(isAdmin)&&(
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>แก้ไขข้อมูลรถ</DialogTitle>
        <DialogContent>
          <TextField
            label="Vehicle Name"
            name="name"
            value={updatedVehicle.name}
            onChange={handleEditChange}
            fullWidth
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Model"
            name="model"
            value={updatedVehicle.model}
            onChange={handleEditChange}
            fullWidth
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="License Plate"
            name="license_plate"
            value={updatedVehicle.license_plate}
            onChange={handleEditChange}
            fullWidth
            style={{ marginBottom: '10px' }}
          />
          {/* <TextField
            label="Fuel Capacity"
            name="fuel_capacity"
            value={updatedVehicle.fuel_capacity}
            onChange={handleEditChange}
            fullWidth
            style={{ marginBottom: '10px' }}
          /> */}
          <TextField
            label="Fuel Type"
            name="fuel_type"
            value={updatedVehicle.fuel_type}
            onChange={handleEditChange}
            fullWidth
            style={{ marginBottom: '10px' }}
          />
          {/* <TextField
            label="Description"
            name="description"
            value={updatedVehicle.description}
            onChange={handleEditChange}
            fullWidth
            multiline
            rows={3}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      )}
    </div>
  );
};

export default VehicleList;
