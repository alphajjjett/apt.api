import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';

const MaintenancePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'admin');
    } catch (err) {
      setError('Failed to decode token');
    }

    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
      } catch (error) {
        setError('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

   // ฟังก์ชันสำหรับจัดการการค้นหา
   const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // ฟิลเตอร์ข้อมูลจากสถานะที่เป็น 'maintenance'
  const filteredVehicles = vehicles.filter((vehicle) => {
    return vehicle.status.toLowerCase().includes('maintenance') &&
           vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <p>Loading maintenance data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการซ่อมบำรุง</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ยอดการซ่อมบำรุง</h3>
          <p className="text-gray-600 text-2xl">{filteredVehicles.length}</p>
        </div>
      </div>


      <TextField
        label="ค้นหาโดยเลขทะเบียน"
        variant="outlined"
        fullWidth
        // type="text"
        value={searchQuery}
        onChange={handleSearch}
        // placeholder="ค้นหารถยนต์..."
        style={{ marginBottom: '20px' }}
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="maintenance table">
          <TableHead>
            <TableRow>
              <TableCell>ยี่ห้อรถ</TableCell>
              <TableCell align="right">รุ่น</TableCell>
              <TableCell align="right">ทะเบียน</TableCell>
              <TableCell align="right">รายละเอียดการซ่อมบำรุง</TableCell>
              <TableCell align="right">สถานะของรถ</TableCell>
              <TableCell align="right">วันที่ / เวลา</TableCell>
              {/* {isAdmin && <TableCell align="right">Actions</TableCell>} */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell component="th" scope="row">
                  {vehicle.name}
                </TableCell>
                <TableCell align="right">{vehicle.model}</TableCell>
                <TableCell align="right">{vehicle.license_plate}</TableCell>
                <TableCell align="right">{vehicle.description || 'N/A'}</TableCell>
                <TableCell align="right">{vehicle.status}</TableCell>
                <TableCell align="right">
                  {vehicle.updatedAt
                    ? new Date(vehicle.updatedAt).toLocaleString()
                    : 'N/A'}
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    {/* ไม่รู้จะเพิ่มอะไร */}
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

export default MaintenancePage;
