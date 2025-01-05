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

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [updatedMission, setUpdatedMission] = useState({});
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

      await axios.put(`http://localhost:5000/api/missions/${selectedMission._id}`, updatedMission, config);
      setMissions(missions.map((mission) =>
        mission._id === selectedMission._id ? { ...mission, ...updatedMission } : mission
      ));

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
    <div className="container">
      <h2>Mission List</h2>

      {/* Search box */}
      <TextField
        label="Search by Self ID"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />

      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">Total Mission</h3>
          <p className="text-gray-600 text-2xl">{filteredMissions.length}</p>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="mission table">
        <TableHead>
        <TableRow>
          <TableCell>Mission Name</TableCell>
          <TableCell align="left">Description</TableCell>
          <TableCell align="left">Self ID</TableCell>
          <TableCell align="left">Assigned User</TableCell>
          <TableCell align="left">Start Date</TableCell>
          <TableCell align="left">End Date</TableCell>
          <TableCell align="left">Vehicle</TableCell>
          <TableCell align="left">Status</TableCell>
          <TableCell align="left">Last Updated</TableCell>
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
                <TableCell align="left">{mission.description}</TableCell>
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
                  {mission.assigned_vehicle_id.name} ({mission.assigned_vehicle_id.license_plate})
                </TableCell>
                <TableCell align="left">{mission.status}</TableCell>
                <TableCell align="left">
                  {new Date(mission.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="left">
                  {/* ตรวจสอบว่า user เป็น admin หรือ assigned_user_id.selfid ตรงกับ selfid ของ user ที่ล็อกอิน */}
                  {(isAdmin || mission.assigned_user_id?.selfid === JSON.parse(atob(localStorage.getItem('token').split('.')[1])).selfid) && (
                    <div>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditClick(mission)}
                        disabled={mission.status !== 'pending'} // Disable if status is not 'pending'
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(mission._id)}
                        disabled={mission.status !== 'pending'} // Disable if status is not 'pending'
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Mission</DialogTitle>
        <DialogContent>
          <TextField
            label="Mission Name"
            variant="outlined"
            fullWidth
            name="mission_name"
            value={updatedMission.mission_name || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px', marginTop:'10px' }}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            name="description"
            value={updatedMission.description || ''}
            onChange={handleEditChange}
            style={{ marginBottom: '10px', marginTop:'5px' }}
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
    </div>
  );
};

export default MissionList;
