import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const FuelPage = () => {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]); // state สำหรับเก็บข้อมูล vehicles
  const [users, setUsers] = useState([]); // state สำหรับเก็บข้อมูล users
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // ดึงข้อมูล fuel records
        const fuelResponse = await axios.get('http://localhost:5000/api/fuel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelRecords(fuelResponse.data);

        // ดึงข้อมูล vehicles ทั้งหมด
        const vehicleResponse = await axios.get('http://localhost:5000/api/vehicles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVehicles(vehicleResponse.data);

        // ดึงข้อมูล users ทั้งหมด
        const userResponse = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(userResponse.data);
      } catch (error) {
        setError('Failed to fetch fuel records, vehicles, or users');
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch data from server',
          icon: 'error',
        });
      }
    };
    const { role } = JSON.parse(atob(token.split('.')[1])); // decode JWT
    setIsAdmin(role === 'admin');
    fetchData();
  }, []); // ดึงข้อมูลเมื่อเริ่มต้นเพจ

  const handleStatusChange = async (fuelRecordId, newStatus) => {
    try {
      // อัปเดตสถานะ fuel record
      await axios.put(`http://localhost:5000/api/fuel/${fuelRecordId}`, { status: newStatus });

      // ดึงข้อมูลใหม่หลังจากอัปเดตสถานะแล้ว
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fuel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFuelRecords(response.data); // ตั้งค่าข้อมูลที่ดึงมาใหม่

      Swal.fire({
        title: 'Success!',
        text: 'Fuel record status updated successfully',
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update fuel record status',
        icon: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg" >
      <h2 className="text-2xl font-bold text-center mb-6" >ข้อมูลการเบิกเชื้อเพลิง</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">รถที่เบิก</TableCell>
              <TableCell align="left">เลขทะเบียนรถ</TableCell>
              <TableCell align="left">หมายเลขประจำตัว</TableCell>
              <TableCell align="left">ผู้เบิก</TableCell>
              <TableCell align="left">จำนวนเชื้อเพลิง (ลิตร)</TableCell>
              <TableCell align="left">วันที่อนุมัติ</TableCell>
              <TableCell align="left">Status</TableCell>
              {(isAdmin)&&(
              <TableCell align="left">Action</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {fuelRecords.map((record) => {
              // หาข้อมูล vehicle และ user จาก id
              const vehicle = vehicles.find((v) => v._id === record.vehicleId);
              const user = users.find((u) => u._id === record.userId);

              return (
                <TableRow key={record._id}>
                  <TableCell align="left">{vehicle ? vehicle.name : 'N/A'}</TableCell> 
                  <TableCell align="left">{vehicle ? vehicle.license_plate : 'N/A'}</TableCell> 
                  <TableCell align="left">{user ? user.selfid : 'N/A'}</TableCell> 
                  <TableCell align="left">{user ? user.name : 'N/A'}</TableCell> 
                  <TableCell align="left">{record.fuelCapacity} ลิตร </TableCell>
                  <TableCell align="left">{new Date(record.fuelDate).toLocaleString()}</TableCell>
                  <TableCell align="left">
                    {record.status === 'pending' ? (
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                          รออนุมัติ
                        </span>
                        ) : record.status === 'completed' ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                          สำเร็จ
                      </span>
                    ) : null}
                  </TableCell>
                  {/* <TableCell>{record.status}</TableCell> */}
                  {(isAdmin)&&(
                  <TableCell>
                    {(
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStatusChange(record._id, 'completed')}
                        disabled={record.status === 'completed'}
                      >
                        {record.status === 'completed' ? 'อนุมัติเรียบร้อย' : 'อนุมัติ'}
                      </Button>
                    )}
                  </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default FuelPage;
