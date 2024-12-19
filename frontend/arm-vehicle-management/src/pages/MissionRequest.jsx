import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import { Select } from '@mui/material';

const MissionRequest = () => {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions');
        setMissions(response.data);
      } catch (error) {
        setError('Failed to fetch missions');
      }
    };

    fetchMissions();
  }, []);

  const handleStatusChange = async (missionId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/missions/${missionId}/status`, {
        status: newStatus,
      });
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission._id === missionId ? { ...mission, status: newStatus } : mission
        )
      );
      alert('Mission status updated successfully');
    } catch (error) {
      setError('Failed to update mission status');
    }
  };

  return (
    <div className="container">
      <h2>Mission Requests</h2>
      {error && <p className="error-message">{error}</p>}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="missions table">
          <TableHead>
            <TableRow>
              <TableCell>Mission Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Update Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {missions.map((mission) => (
              <TableRow key={mission._id}>
                <TableCell component="th" scope="row">
                  {mission.mission_name}
                </TableCell>
                <TableCell>{mission.description}</TableCell>
                <TableCell>{mission.status}</TableCell>
                <TableCell align="right">
                  <Select
                    value={mission.status}
                    onChange={(e) => handleStatusChange(mission._id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MissionRequest;
