import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { jwtDecode } from 'jwt-decode';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Print from "../../src/components/print/FuelPrint";
import PrintAll from '../components/print/FuelPrintAll';
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

const FuelPage = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]); // State สำหรับข้อมูลการเบิกน้ำมัน
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFuelRecord, setSelectedFuelRecord] = useState(null); // state สำหรับเก็บ record ที่เลือก
  const [fuelCapacity, setFuelCapacity] = useState(''); // state สำหรับเก็บจำนวนเชื้อเพลิงที่ต้องการอัปเดต
  const [userData, setUserData] = useState(null); // เก็บข้อมูลของผู้ใช้ที่ login
  const navigate = useNavigate();

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

        // ดึงข้อมูล fuel (การเบิกน้ำมัน)
        const fuelResponse = await axios.get('http://localhost:5000/api/fuel', config);
        setFuelRecords(fuelResponse.data);  // เก็บข้อมูล fuel records ใน state

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

  const handleEditClick = (fuelRecord) => {
    setSelectedFuelRecord(fuelRecord); // set selected record ที่เลือก
    setFuelCapacity(fuelRecord.fuelCapacity || ''); // ตั้งค่า fuelCapacity ให้เป็นค่าจาก fuelAmount
    setOpenDialog(true); // เปิด dialog
  };
  

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleGoToMlist = () => {
    navigate('/missionslist'); // เปลี่ยนไปที่หน้า missions list
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      // ตรวจสอบว่า fuelCapacity เป็นจำนวนที่ถูกต้อง
      if (fuelCapacity <= 0) {
        MySwal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'กรุณาระบุจำนวนเชื้อเพลิงที่ถูกต้อง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        return;
      }
  
      // ส่งข้อมูลที่แก้ไขไปยังเซิร์ฟเวอร์ (อัปเดต fuelAmount)
      await axios.put(`http://localhost:5000/api/fuel/${selectedFuelRecord._id}`, { fuelCapacity }, config)
        .then((response) => {
          console.log('API Response:', response.data); // เช็คผลลัพธ์จาก API
        })
        .catch((error) => {
          console.error('Error saving fuel record:', error);
        });
  
      // อัปเดตข้อมูลใน state (อัปเดต fuelAmount ใน state ด้วย)
      setFuelRecords(prevFuelRecords => 
        prevFuelRecords.map((record) =>
          record._id === selectedFuelRecord._id
            ? { ...record, fuelCapacity }  // อัปเดต fuelAmount
            : record
        )
      );
  
      // แสดงการแจ้งเตือนว่าอัปเดตสำเร็จ
      MySwal.fire({
        title: 'สำเร็จ!',
        text: 'ข้อมูลการเบิกเชื้อเพลิงถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
    } catch (error) {
      // แสดงการแจ้งเตือนกรณีเกิดข้อผิดพลาด
      MySwal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      console.error('Error saving fuel record:', error);
    }
  };

  
  

  // ตรวจสอบสิทธิ์ในการแก้ไข
  const canEdit = (mission, vehicle, user) => {
    if (!userData) return false;
    if (userData.role === 'admin') return true; // แอดมินสามารถแก้ไขได้ตลอด
    if (mission.status === 'completed' || mission.status === 'in-progress') return false; // ห้ามแก้ไขถ้า mission เป็น completed ยกเว้นแอดมิน
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
    const fuelRecord = fuelRecords.find(fuel => fuel.vehicleId === vehicle._id); // หา fuel record ที่ตรงกับ vehicle
    return total + (fuelRecord ? parseFloat(fuelRecord.fuelCapacity) || 0 : 0); // ใช้ข้อมูลจาก fuel record
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
        <Button variant="outlined" color="primary">
          <PDFDownloadLink document={<PrintAll vehicles={vehicles} users={users} fuelRecords={fuelRecords} />} fileName="AllFuel.pdf">
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
              <TableCell align="center">Actions</TableCell>
              <TableCell>พิมพ์เอกสาร</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {filteredMissions.map((mission) => {
    const vehicle = vehicles.find(v => v._id === mission.assigned_vehicle_id._id);
    const user = users.find(u => u._id === mission.assigned_user_id._id);
    const fuelRecord = fuelRecords.find(fuel => fuel.vehicleId === vehicle._id); // ดึง fuel record สำหรับ vehicle

    return (
      vehicle && user && fuelRecord && (
        <TableRow key={mission._id}>
          <TableCell component="th" scope="row">{vehicle.name}</TableCell>
          <TableCell align="left">{vehicle.license_plate}</TableCell>
          <TableCell align="right">{user.selfid || 'N/A'}</TableCell>
          <TableCell align="right">{user.name || 'N/A'}</TableCell>
          <TableCell align="right">{fuelRecord.fuelCapacity || 'N/A'} ลิตร</TableCell> 
          <TableCell align="right">
            {fuelRecord.fuelDate ? new Date(fuelRecord.fuelDate).toLocaleString() : 'N/A'}
          </TableCell>

          <TableCell align="center">
            {canEdit(mission, vehicle, user,) && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleEditClick(fuelRecord)}
              >
                แก้ไข
              </Button>
            )}
          </TableCell>
          <TableCell>
            <PDFDownloadLink document={<Print vehicle={vehicle} user={user} fuelRecord={fuelRecord} />} fileName={`${mission.assigned_user_id.selfid}_Fuel.pdf`}>
              {({ loading }) => (loading ? 'Loading...' : 'พิมพ์เอกสาร')}
            </PDFDownloadLink>
          </TableCell>
        </TableRow>
      )
    );
  })}
</TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขข้อมูลเชื้อเพลิง</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="จำนวนเชื้อเพลิง (ลิตร)"
            fullWidth
            variant="outlined"
            value={fuelCapacity}
            onChange={(e) => setFuelCapacity(e.target.value)} // ตั้งค่า fuelCapacity
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            ยกเลิก
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              handleGoToMlist(); // ไปยังหน้า missions list หลังจากบันทึก
            }} 
            color="primary"
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FuelPage;
