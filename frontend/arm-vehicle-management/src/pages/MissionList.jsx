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
import MenuItem from '@mui/material/MenuItem';
import { Select } from '@mui/material';
import Modal from 'react-bootstrap/Modal';

const MySwal = withReactContent(Swal);

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [updatedMission, setUpdatedMission] = useState({});

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMissions(response.data);
      } catch (error) {
        setError('Failed to fetch missions');
      } finally {
        setLoading(false);
      }
    };

    const { role } = JSON.parse(atob(token.split('.')[1])); // decode JWT
    setIsAdmin(role === 'admin');
    fetchMissions();
  }, [navigate]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles');
        const availableVehicles = response.data.filter(vehicle => vehicle.status === 'available');
        setVehicles(availableVehicles);
      } catch (error) {
        setError('Failed to fetch vehicles');
      }
    };
    fetchVehicles();
  }, []);

  // ดูให้หน่อยดิ้
  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    setSelectedVehicle(vehicle);  
    setShowModal(false); 
  };

  const handleReturnClick = (mission) => {
    const returnData = {
      user: mission.assigned_user_id.name,  
      vehicle: mission.assigned_vehicle_id.name, 
      licensePlate: mission.assigned_vehicle_id.license_plate, 
      bookingDate: mission.start_date,      
      returnDate: new Date(),               
      returnStatus: 'pending',            
      description: "", 
    };
    const token = localStorage.getItem('token');
    console.log('Return Data:', returnData);
    console.log('Mission ID:', mission._id);
    
    axios.post(`http://localhost:5000/api/return/${mission._id}`, returnData, {
      headers: {
        Authorization: `Bearer ${token}`, 
      }
    })
    .then((response) => {
      console.log('Return Success:', response.data);
      Swal.fire({
        title: 'Return Success',
        text: 'The vehicle has been successfully returned.',
        icon: 'success',
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'There was an error while returning the vehicle.',
        icon: 'error',
      });
    });
  };
  
  
  
  


  const handleStatusChange = async (missionId, newStatus) => {
    const token = localStorage.getItem('token');
    const { selfid } = JSON.parse(atob(token.split('.')[1])); // decode token to get selfid of the logged-in user
  
    const missionToUpdate = missions.find(mission => mission._id === missionId);
  
    // Check if the current user is the assigned user or an admin
    if (missionToUpdate.assigned_user_id?.selfid !== selfid && !isAdmin) {
      MySwal.fire({
        title: "Not Authorized",
        text: "You are not authorized to change the status of this mission.",
        icon: "error"
      });
      return;
    }
  
    try {
      // Update mission status
      await axios.put(`http://localhost:5000/api/missions/${missionId}/status`, {
        status: newStatus,
      });
  
      // If status is completed or in-progress, update the vehicle status to in-use
      if ((newStatus === 'completed' || newStatus === 'in-progress') && missionToUpdate.assigned_vehicle_id) {
        const vehicleId = missionToUpdate.assigned_vehicle_id._id;
        await axios.put(`http://localhost:5000/api/vehicles/${vehicleId}`, {
          status: 'in-use',
        });
      }
  
      // Update the missions state
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission._id === missionId ? { ...mission, status: newStatus } : mission
        )
      );
  
      Swal.fire({
        title: 'Success!',
        text: 'Mission status and vehicle status updated successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      setError('Failed to update mission status');
  
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update mission or vehicle status',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  

  

  const handleDelete = async (missionId) => {
    const token = localStorage.getItem('token');
    const { selfid } = JSON.parse(atob(token.split('.')[1])); // decode token to get selfid of the logged-in user
  
    // Find the mission that we are about to delete
    const missionToDelete = missions.find(mission => mission._id === missionId);
  
    // Check if the mission is assigned to the current user or if the user is admin
    if (missionToDelete.assigned_user_id?.selfid !== selfid && !isAdmin) {
      MySwal.fire({
        title: "Not Authorized",
        text: "You are not authorized to delete this mission.",
        icon: "error"
      });
      return;
    }
  
    // If authorized, show the confirmation dialog
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
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
  
          await axios.delete(`http://localhost:5000/api/missions/${missionId}`, config);
          setMissions(missions.filter((mission) => mission._id !== missionId)); // Remove the deleted mission from the state
  
          MySwal.fire({
            title: "Deleted!",
            text: "The mission has been deleted.",
            icon: "success"
          });
        } catch (error) {
          MySwal.fire({
            title: "Error",
            text: "There was an error deleting the mission.",
            icon: "error"
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancelled",
          text: "Your mission is safe :)",
          icon: "error"
        });
      }
    });
  };
  

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredMissions = missions.filter((mission) => {
    const selfid = mission.assigned_user_id?.selfid || ''; // Fallback to an empty string if selfid is undefined
    return selfid.includes(searchQuery);
  });

  const handleGoToFuel = () => {
    navigate('/fuel'); // เปลี่ยนไปที่หน้า fuel
  };

  const handleGoToReturn = () => {
    navigate('/return'); // เปลี่ยนไปที่หน้า fuel
  };


  const handleEditClick = (mission) => {
    const token = localStorage.getItem('token');
    const { selfid } = JSON.parse(atob(token.split('.')[1])); // get logged-in user's selfid

    // Check if the logged-in user is the same as the assigned user for this mission
    if (mission.assigned_user_id.selfid !== selfid && !isAdmin) {
      MySwal.fire({
        title: "Not Authorized",
        text: "You can only edit your own missions.",
        icon: "error"
      });
      return;
    }

    setSelectedMission(mission);
    setUpdatedMission({
      mission_name: mission.mission_name,
      description: mission.description,
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setUpdatedMission({ ...updatedMission, [name]: value });
  };
  

  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const updatedMissionWithVehicle = {
        ...updatedMission,
        assigned_vehicle_id: selectedVehicle ? selectedVehicle._id : selectedMission.assigned_vehicle_id._id, 
      };
  
      // ส่งข้อมูลที่อัปเดตไปยังเซิร์ฟเวอร์
      await axios.put(`http://localhost:5000/api/missions/${selectedMission._id}`, updatedMissionWithVehicle, config);
  
      // อัปเดตสถานะของ mission ใน state พร้อมกับ assigned_vehicle_id ใหม่
      setMissions(missions.map((mission) =>
        mission._id === selectedMission._id
          ? { ...mission, ...updatedMissionWithVehicle, assigned_vehicle_id: selectedVehicle } // อัปเดตข้อมูลรถด้วย
          : mission
      ));
  
      // แสดงการแจ้งเตือนการอัปเดตสำเร็จ
      MySwal.fire({
        title: "Updated!",
        text: "Your mission has been updated.",
        icon: "success"
      });
  
      setEditDialogOpen(false);
    } catch (error) {
      MySwal.fire({
        title: "Error",
        text: "There was an error updating the mission.",
        icon: "error"
      });
    }
  };
  

  if (loading) return <p>Loading missions...</p>;

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6" >ข้อมูลภารกิจ</h2>

      

      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ยอดข้อมูลภารกิจ</h3>
          <p className="text-gray-600 text-2xl">{filteredMissions.length}</p>
        </div>
      </div>

      {/* Search box */}
      <TextField
        label="Search by Self ID"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="mission table">
        <TableHead>
        <TableRow>
          <TableCell>ภารกิจ</TableCell>
          {/* <TableCell align="left">Description</TableCell> */}
          <TableCell align="left">หมายเลขประจำตัวผู้จอง</TableCell>
          <TableCell align="left">ชื่อผู้จอง</TableCell>
          <TableCell align="left">วันที่จอง</TableCell>
          <TableCell align="left">วันที่คืน</TableCell>
          <TableCell align="left">ยี่ห้อรถ</TableCell>
          <TableCell align="left">สถานะ</TableCell>
          <TableCell align="left">อัพเดทล่าสุด</TableCell>
          {(isAdmin) && (
            <TableCell align="left">
              เปลี่ยนสถานะ
            </TableCell>
          )}
          {/* เพิ่มการตรวจสอบเงื่อนไข assigned_user_id.selfid ด้วย */}
          {(isAdmin || filteredMissions.some(mission => mission.assigned_user_id?.selfid === JSON.parse(atob(localStorage.getItem('token')?.split('.')[1])).selfid)) && (
            <TableCell align="left">
              Actions
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
          {filteredMissions.map((mission) => (
            <TableRow key={mission._id}>
              <TableCell component="th" scope="row">
                {mission.mission_name}
              </TableCell>
              <TableCell align="left">
                {mission.assigned_user_id
                  ? mission.assigned_user_id.selfid
                  : 'N/A'}
              </TableCell>
              <TableCell align="left">
                {mission.assigned_user_id
                  ? mission.assigned_user_id.name
                  : 'N/A'}
              </TableCell>
              <TableCell align="left">
                {new Date(mission.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell align="left">
                {new Date(mission.end_date).toLocaleDateString()}
              </TableCell>
              <TableCell align="left">
                {mission.assigned_vehicle_id?.name || 'N/A'} 
                ({mission.assigned_vehicle_id?.license_plate || 'N/A'})
              </TableCell>
              <TableCell align="left">
                {mission.status}
              </TableCell>
              <TableCell align="left">
                {new Date(mission.updatedAt).toLocaleDateString()}
              </TableCell>
              
              {/* Show the status dropdown if the user is an admin */}
              {isAdmin && (
                <TableCell align="left">
                  <Select
                    value={mission.status}
                    onChange={(e) => handleStatusChange(mission._id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </TableCell>
              )}
              
              {/* Show edit/delete actions based on admin or assigned user permissions */}
              {(isAdmin || mission.assigned_user_id?.selfid === JSON.parse(atob(localStorage.getItem('token').split('.')[1])).selfid) && (
                <TableCell align="left">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditClick(mission)}
                    disabled={mission.status !== 'pending' && !isAdmin} // Disable if status is not 'pending'
                  >
                    รายละเอียด
                  </Button>
                  {/* ปุ่มสำหรับไปยังหน้า fuel */}
                  <Button
                     variant="outlined"
                    color="primary"
                    onClick={handleGoToFuel}
                  >
                    เบิกน้ำมัน
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(mission._id)}
                    disabled={mission.status !== 'pending' && !isAdmin} // Disable if status is not 'pending'
                  >
                    ลบข้อมูล
                  </Button>
                  {/* แสดงปุ่มคืนรถเมื่อวันที่ปัจจุบันถึง end_date */}
                  {isAdmin && new Date() >= new Date(mission.end_date) && (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => {
                        handleReturnClick(mission);
                        handleGoToReturn(); 
                      }}
                      disabled={mission.status === 'completed' || (!isAdmin && mission.status !== 'pending')}
                    >
                      คืนรถ
                    </Button>
                  )}
                </TableCell>
              )}

            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
      <DialogTitle>ข้อมูลการจอง</DialogTitle>
        <DialogContent>
          {selectedMission && (
            <div>
              <p><strong>ภารกิจ:</strong> {selectedMission.mission_name}</p>
              <p><strong>รายละเอียดภารกิจ:</strong> {selectedMission.description}</p>
              <p><strong>ผู้จอง:</strong> {selectedMission.assigned_user_id?.name || 'N/A'}</p>
              <p><strong>วันที่จอง:</strong> {new Date(selectedMission.start_date).toLocaleDateString()}</p>
              <p><strong>วันที่คืน:</strong> {new Date(selectedMission.end_date).toLocaleDateString()}</p>
              <p><strong>ยี่ห้อรถ:</strong> {selectedMission.assigned_vehicle_id?.name || 'N/A'} ({selectedMission.assigned_vehicle_id?.license_plate || 'N/A'})</p>
              <p><strong>จำนวนเชื้อเพลิงที่เบิก:</strong> {selectedMission.assigned_vehicle_id?.fuel_capacity || 'N/A'} </p>
              {/* <p><strong>สถานะ:</strong> {selectedMission.status}</p> */}
              {/* <p><strong>Last Updated:</strong> {new Date(selectedMission.updatedAt).toLocaleDateString()}</p> */}
            </div>
          )}
        </DialogContent>

        <DialogTitle>แก้ไขข้อมูลการจอง</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อภารกิจ"
            variant="outlined"
            fullWidth
            name="mission_name"
            value={updatedMission.mission_name || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px', marginTop:'10px' }}
          />
          <TextField
            label="รายละเอียดภารกิจ"
            variant="outlined"
            fullWidth
            name="description"
            value={updatedMission.description || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px', marginTop:'5px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowModal(true)} // เปิด modal สำหรับเลือก vehicle
            style={{ marginTop: '10px' }}
          >
            {selectedVehicle
              ? `${selectedVehicle.name} (${selectedVehicle.license_plate})`  // แสดงรถที่ถูกเลือก
              : 'Select Vehicle'}
          </Button>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            ยกเลิก
          </Button>
          <Button onClick={handleSubmitEdit} color="primary">
            บันทึก
          </Button>
        </DialogActions>

      </Dialog>

      
        {/* Modal for vehicle selection */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" style={{ zIndex: 3000 }} >
          <Modal.Header closeButton>
            <Modal.Title>เลือกรถ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="border border-gray-300 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                  onClick={() => handleVehicleSelect(vehicle._id)}
                >
                  <div className="font-bold text-lg">{vehicle.name}</div>
                  <div className="text-sm text-gray-500">รุ่น: {vehicle.model}</div>
                  <div className="text-sm text-gray-500">ทะเบียน: {vehicle.license_plate}</div>
                  <div className="text-sm text-gray-500">เชื้อเพลิง: {vehicle.fuel_type}</div>
                  <div className="text-sm text-gray-500">ข้อมูลซ่อมบำรุงล่าสุด: {vehicle.description}</div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              ยกเลิก
            </button>
          </Modal.Footer>
        </Modal>
    </div>
  );
};

export default MissionList;
