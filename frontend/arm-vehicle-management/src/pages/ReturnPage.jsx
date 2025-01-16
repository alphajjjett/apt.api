import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, Box, TextField } from '@mui/material';

const ReturnInformation = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State สำหรับเปิด/ปิด Modal แก้ไข description
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // State สำหรับเปิด/ปิด Modal ดูรายละเอียด
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const [newDescription, setNewDescription] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/return', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReturns(response.data);
        const { role } = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(role === 'admin');
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch return data');
        setLoading(false);
        Swal.fire({
          title: 'Error',
          text: 'There was an error fetching return data.',
          icon: 'error',
        });
      }
    };

    fetchReturns();
  }, []);

  const handleEditDescription = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditModalOpen(true); // เปิด Modal แก้ไขคำอธิบาย
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem('token');
  
      // สร้างข้อมูลการบำรุงรักษาใหม่ใน maintenance
      const maintenanceData = {
        vehicleId: selectedVehicle._id,
        description: newDescription, // เก็บคำอธิบายการบำรุงรักษา
      };
  
      await axios.post('http://localhost:5000/api/maintenance', maintenanceData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // อัปเดตข้อมูลใน state
      setReturns((prevReturns) =>
        prevReturns.map((ret) => {
          if (ret.vehicle._id === selectedVehicle._id) {
            return { ...ret, vehicle: { ...ret.vehicle, description: newDescription } };
          }
          return ret;
        })
      );
  
      setEditModalOpen(false); // ปิด Modal
      Swal.fire({
        title: 'Success',
        text: 'Maintenance description saved successfully!',
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'There was an error saving the maintenance description.',
        icon: 'error',
      });
    }
  };
  

  const handleConfirm = async (returnId, vehicleId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5000/api/return/${returnId}`,
        { returnStatus: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReturns((prevReturns) =>
        prevReturns.map((ret) =>
          ret._id === returnId ? { ...ret, returnStatus: 'completed' } : ret
        )
      );

      await axios.put(
        `http://localhost:5000/api/vehicles/${vehicleId}`,
        { status: 'maintenance' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReturns((prevReturns) =>
        prevReturns.map((ret) => {
          if (ret._id === returnId) {
            return {
              ...ret,
              vehicle: { ...ret.vehicle, status: 'maintenance' },
            };
          }
          return ret;
        })
      );

      Swal.fire({
        title: 'Success',
        text: 'Return status updated to completed and vehicle status set to maintenance.',
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'There was an error updating the return status and vehicle status.',
        icon: 'error',
      });
    }
  };

  const handleViewDetails = (returnData) => {
    setSelectedReturn(returnData);
    setDetailsModalOpen(true); // เปิด Modal ดูรายละเอียด
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการคืนรถ</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ภารกิจ</TableCell>
              <TableCell>หมายเลขประจำตัวผู้จอง</TableCell>
              <TableCell>ชื่อผู้จอง</TableCell>
              <TableCell>ยี่ห้อรถ</TableCell>
              <TableCell>ทะเบียน</TableCell>
              <TableCell>วันที่คืน</TableCell>
              <TableCell>วันที่ตรวจซ่อม</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.map((ret) => (
              <TableRow key={ret._id}>
                <TableCell>{ret.mission.mission_name}</TableCell>
                <TableCell>{ret.user.selfid}</TableCell>
                <TableCell>{ret.user.name}</TableCell>
                <TableCell>{ret.vehicle.name}</TableCell>
                <TableCell>{ret.vehicle.license_plate}</TableCell>
                <TableCell>{new Date(ret.bookingDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                <TableCell>{ret.returnStatus}</TableCell>
                <TableCell>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditDescription(ret.vehicle)}
                    disabled={ret.returnStatus === 'completed'}
                  >
                    {ret.returnStatus === 'completed' ? 'คืนรถเรียบร้อย' : 'ใส่ข้อมูลหลังตรวจสอบรถ'}
                  </Button>
                )}
                {ret.returnStatus !== 'completed' && isAdmin && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleConfirm(ret._id, ret.vehicle._id)}
                  >
                    ยืนยัน
                  </Button>
                )}
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => handleViewDetails(ret)}
                  >
                    รายละเอียด
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal สำหรับดูรายละเอียดการคืนรถ */}
      <Modal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedReturn ? (
            <>
              <h3>ข้อมูลการคืนรถ</h3>
              <p><strong>ภารกิจ:</strong> {selectedReturn.mission.mission_name}</p>
              <p><strong>ผู้จอง:</strong> {selectedReturn.user.name}</p>
              <p><strong>ยี่ห้อรถ:</strong> {selectedReturn.vehicle.name}</p>
              <p><strong>ทะเบียน:</strong> {selectedReturn.vehicle.license_plate}</p>
              <p><strong>วันที่จอง:</strong> {new Date(selectedReturn.bookingDate).toLocaleDateString()}</p>
              <p><strong>วันที่คืน:</strong> {new Date(selectedReturn.returnDate).toLocaleDateString()}</p>
              <p><strong>สถานะ:</strong> {selectedReturn.returnStatus}</p>
            </>
          ) : (
            <p>No details available.</p>
          )}
          <Button onClick={() => setDetailsModalOpen(false)} color="secondary" sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>

      {/* Modal สำหรับแก้ไข description */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <h3>ใส่ข้อมูลหลังการตรวจสอบ</h3>
          <TextField
            label="รายละเอียดการตรวจสอบ"
            fullWidth
            multiline
            rows={4}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button 
              onClick={() => setEditModalOpen(false)} 
              color="secondary">
                ยกเลิก
              </Button>
            <Button 
              onClick={handleSaveDescription} 
              color="primary">
                บันทึก
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ReturnInformation;
