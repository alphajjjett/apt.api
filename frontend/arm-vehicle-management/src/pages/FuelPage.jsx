import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const FuelPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false); // เพิ่ม state สำหรับ Dialog
  const [selectedVehicle, setSelectedVehicle] = useState(null); // เก็บยานพาหนะที่เลือก
  const [fuelCapacity, setFuelCapacity] = useState(''); // เก็บค่าที่จะแก้ไข

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // ดึงข้อมูล mission
        const missionResponse = await axios.get('http://localhost:5000/api/missions', config);
        setMissions(missionResponse.data);

        // ดึงข้อมูล vehicle
        const vehicleResponse = await axios.get('http://localhost:5000/api/vehicles', config);
        setVehicles(vehicleResponse.data);

        // ดึงข้อมูลผู้ใช้
        const userResponse = await axios.get('http://localhost:5000/api/users', config);
        setUsers(userResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFuelCapacity(vehicle.fuel_capacity || ''); // เตรียมค่าปัจจุบันของ fuel_capacity เพื่อให้แก้ไข
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      // ส่งข้อมูลที่แก้ไขไปยังเซิร์ฟเวอร์
      await axios.put(`http://localhost:5000/api/vehicles/${selectedVehicle._id}`, { fuel_capacity: fuelCapacity }, config);
  
      // อัปเดตข้อมูลใน state
      setVehicles(vehicles.map((vehicle) =>
        vehicle._id === selectedVehicle._id
          ? { ...vehicle, fuel_capacity: fuelCapacity }
          : vehicle
      ));
  
      // แสดงการแจ้งเตือนสำเร็จ
      MySwal.fire({
        title: "Success!",
        text: "Fuel capacity has been updated.",
        icon: "success",
        confirmButtonText: "OK"
      });
  
      setOpenDialog(false); // ปิด Dialog
    } catch (err) {
      // แสดงการแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      MySwal.fire({
        title: "Error",
        text: "There was an error updating the fuel capacity.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  // กรองข้อมูลตาม license_plate
  const filteredMissions = missions.filter((mission) => {
    const vehicle = vehicles.find(v => v._id === mission.assigned_vehicle_id._id);
    return vehicle && vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Fuel Capacity Records</h2>

      {/* ช่องค้นหากรองข้อมูลตาม license_plate */}
      <TextField
        label="ค้นหาเลขทะเบียน"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />

<TableContainer component={Paper}>
  <Table sx={{ minWidth: 650 }} aria-label="fuel table">
    <TableHead>
      <TableRow>
        <TableCell>Vehicle Name</TableCell>
        <TableCell align="left">License Plate</TableCell>
        <TableCell align="right">Self ID</TableCell>
        <TableCell align="right">Username</TableCell>
        <TableCell align="right">Fuel Capacity (liters)</TableCell>
        <TableCell align="right">Last Update</TableCell> {/* คอลัมน์ Last Update */}
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredMissions.map((mission) => {
        const vehicle = vehicles.find(v => v._id === mission.assigned_vehicle_id._id);
        const user = users.find(u => u._id === mission.assigned_user_id._id);

        return (
          vehicle && user && (
            <TableRow key={mission._id}>
              <TableCell component="th" scope="row">{vehicle.name}</TableCell>
              <TableCell align="left">{vehicle.license_plate}</TableCell>
              <TableCell align="right">{user.selfid || 'N/A'}</TableCell>
              <TableCell align="right">{user.name || 'N/A'}</TableCell>
              <TableCell align="right">{vehicle.fuel_capacity || 'N/A'}</TableCell>
              
              {/* เพิ่มคอลัมน์ Last Update */}
              <TableCell align="right">
                {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleString() : 'N/A'}
              </TableCell>

              <TableCell align="right">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEditClick(vehicle)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          )
        );
      })}
    </TableBody>
  </Table>
</TableContainer>


      {/* Dialog สำหรับการแก้ไข Fuel Capacity */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Fuel Capacity</DialogTitle>
        <DialogContent>
          <TextField
            label="Fuel Capacity"
            variant="outlined"
            fullWidth
            value={fuelCapacity}
            onChange={(e) => setFuelCapacity(e.target.value)}
            type="number"
            style={{ marginBottom: '20px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FuelPage;
