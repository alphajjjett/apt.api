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
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // ตรวจสอบว่าเป็น Admin หรือไม่
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
    }

    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
  
          await axios.delete(`http://localhost:5000/api/missions/${missionId}`, config);
          setMissions(missions.filter((mission) => mission._id !== missionId));
          
          MySwal.fire({
            title: "Deleted!",
            text: "Your mission has been deleted.",
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

  if (loading) return <p>Loading missions...</p>;

  if (error) {
    return <p>{error}</p>;
  }

  if (missions.length === 0) {
    return <p>No missions available</p>;
  }

  return (
    <div className="container">
    <h2>Mission List</h2>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="mission table">
        <TableHead>
          <TableRow>
            <TableCell>Mission Name</TableCell>
            <TableCell align="left">Description</TableCell>
            <TableCell align="left">Status</TableCell>
            <TableCell align="left">Vehicle</TableCell>
            <TableCell align="left">Assigned User</TableCell>
            <TableCell align="left">Start Date</TableCell>
            <TableCell align="left">End Date</TableCell>
            <TableCell align="left">Last Updated</TableCell>
            {isAdmin && <TableCell align="left">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {missions.map((mission) => (
            <TableRow key={mission._id}>
              <TableCell component="th" scope="row">
                {mission.mission_name}
              </TableCell>
              <TableCell align="left">{mission.description}</TableCell>
              <TableCell align="left">{mission.status}</TableCell>
              <TableCell align="left">
                {mission.assigned_vehicle_id
                  ? mission.assigned_vehicle_id.license_plate
                  : 'N/A'}
              </TableCell>
              <TableCell align="left">
                {mission.assigned_user_id ? mission.assigned_user_id.name : 'N/A'}
              </TableCell>
              <TableCell align="left">
                {new Date(mission.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell align="left">
                {new Date(mission.end_date).toLocaleDateString()}
              </TableCell>
              <TableCell align="left">
                {new Date(mission.updatedAt).toLocaleDateString()}
              </TableCell>
              {isAdmin && (
                <TableCell align="left">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(mission._id)}
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
    </div>
  );
};

export default MissionList;
