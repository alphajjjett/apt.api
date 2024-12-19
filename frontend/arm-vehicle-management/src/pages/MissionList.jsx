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
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        await axios.delete(`http://localhost:5000/api/missions/${missionId}`, config);
        setMissions(missions.filter((mission) => mission._id !== missionId));
        alert('Mission deleted successfully');
      } catch (error) {
        alert('Error deleting mission');
      }
    }
  };

  if (loading) return <p>Loading missions...</p>;

  if (error) {
    return <p>{error}</p>;
  }

  if (missions.length === 0) {
    return <p>No missions available</p>;
  }

  return (
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
  );
};

export default MissionList;
