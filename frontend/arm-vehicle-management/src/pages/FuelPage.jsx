import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {jwtDecode} from 'jwt-decode';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Print from "../../src/components/print/FuelPrint"
import PrintAll from '../components/print/FuelPrintAll';


const MySwal = withReactContent(Swal);

const FuelPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fuelCapacity, setFuelCapacity] = useState('');
  const [userData, setUserData] = useState(null); // เก็บข้อมูลของผู้ใช้ที่ login

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // ดึงข้อมูลผู้ใช้ที่ login
        const decodedToken = jwtDecode(token);
        setUserData(decodedToken);

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
    setFuelCapacity(vehicle.fuel_capacity || '');
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
      MySwal.fire({
        title: "Error",
        text: "There was an error updating the fuel capacity.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  // ตรวจสอบสิทธิ์ในการแก้ไข
  const canEdit = (mission, vehicle, user) => {
    if (!userData) return false;
    if (userData.role === 'admin') return true; // แอดมินสามารถแก้ไขได้ตลอด
    if (mission.status === 'completed' || mission.status === 'in-progress' ) return false; // ห้ามแก้ไขถ้า mission เป็น completed ยกเว้นแอดมิน
    return userData.selfid === user.selfid && !vehicle.edited_by_user; // ถ้า selfid ตรงและยังไม่เคยแก้ไข
  };

  const filteredMissions = missions.filter((mission) => {
    const vehicle = vehicles.find(v => v._id === mission.assigned_vehicle_id._id);
    const userMatch = mission.assigned_user_id.selfid.toLowerCase().includes(searchQuery.toLowerCase());
    const vehicleMatch = vehicle && vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
  
    return vehicleMatch || userMatch; // ค้นหาด้วยป้ายทะเบียน หรือ assigned_user_id.selfid
  });
  
  

  const totalFuelCapacity = filteredMissions.reduce((total, mission) => {
    const vehicle = vehicles.find(v => v._id === mission.assigned_vehicle_id._id);
    return total + (vehicle ? parseFloat(vehicle.fuel_capacity) || 0 : 0);
  }, 0);


  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการเบิกเชื้อเพลิง</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ยอดเชื้อเพลิง</h3>
          <p className="text-gray-600 text-2xl">จำนวน {totalFuelCapacity} ลิตร</p>
        </div>
      </div>

      <div className="mb-3">
      <Button
        variant="outlined"
        color="primary"
      >
        <PDFDownloadLink
          document={<PrintAll missions={missions} vehicles={vehicles} users={users} />}
          fileName="AllFuel.pdf"
        >
          ดาวโหลดข้อมูลทั้งหมด
        </PDFDownloadLink>
      </Button>
      </div>

      <TextField
        label="ค้นหา โดย เลขทะเบียน"
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
              <TableCell>ยี่ห้อรถ</TableCell>
              <TableCell align="left">เลขทะเบียนรถ</TableCell>
              <TableCell align="right">หมายเลขประจำตัวผู้จอง</TableCell>
              <TableCell align="right">ชื่อผู้จอง</TableCell>
              <TableCell align="right">เชื้อเพลิงที่เบิก (ลิตร)</TableCell>
              <TableCell align="right">อัพเดทล่าสุด</TableCell>
              <TableCell align="right">Actions</TableCell>
              <TableCell >พิมพ์เอกสาร</TableCell>
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
                    <TableCell align="right">
                      {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {canEdit(mission, vehicle, user) && (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditClick(vehicle)}
                        >
                          แก้ไข
                        </Button>
                      
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                          variant="outlined"
                          color="primary"
                      >
                        <PDFDownloadLink
                          document={
                            <Print vehicle={vehicle} user={user} />
                          }
                          fileName="Fuel.pdf"
                        >
                          ดาวโหลด
                        </PDFDownloadLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
