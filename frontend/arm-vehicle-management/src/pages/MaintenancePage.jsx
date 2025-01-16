import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PrintMaintenance from '../components/print/MaintenancePrintAll'
import { Button } from '@mui/material';

const MaintenancePage = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

    const fetchMaintenance = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/maintenance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaintenanceRecords(response.data);
      } catch (error) {
        setError('Failed to fetch maintenance records');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  if (loading) return <p>Loading maintenance data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการซ่อมบำรุง</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ยอดการซ่อมบำรุง</h3>
          <p className="text-gray-600 text-2xl">จำนวน {maintenanceRecords.length} คัน</p>
        </div>
      </div>

      {/* ปุ่มดาวน์โหลด PDF */}
      <div className="mb-3">
        <Button
        variant="outlined"
        color="primary"
        >
        <PDFDownloadLink
          document={<PrintMaintenance maintenance={maintenanceRecords} />}
          fileName="Maintenance_Report.pdf"
        >
          ดาวน์โหลดข้อมูลทั้งหมด
        </PDFDownloadLink>
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="maintenance table">
          <TableHead>
            <TableRow>
              <TableCell>ยี่ห้อรถ</TableCell>
              <TableCell align="right">รุ่น</TableCell>
              <TableCell align="right">ทะเบียน</TableCell>
              <TableCell align="right">รายละเอียดการซ่อมบำรุง</TableCell>
              {isAdmin&&(
              <TableCell align="right">สถานะของรถ</TableCell>
               )}
              <TableCell align="right">วันที่ / เวลา</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenanceRecords.map((maintenance) => (
              <TableRow key={maintenance._id}>
                <TableCell component="th" scope="row">
                  {maintenance.vehicleId ? maintenance.vehicleId.name : 'N/A'}
                </TableCell>
                <TableCell align="right">
                  {maintenance.vehicleId ? maintenance.vehicleId.model : 'N/A'}
                </TableCell>
                <TableCell align="right">
                  {maintenance.vehicleId ? maintenance.vehicleId.license_plate : 'N/A'}
                </TableCell>
                <TableCell align="right">{maintenance.description || 'N/A'}</TableCell>
                {isAdmin&&(
                <TableCell align="right">{maintenance.vehicleId ? maintenance.vehicleId.status : 'N/A'}</TableCell> 
                )}
                <TableCell align="right">
                  {maintenance.updatedAt
                    ? new Date(maintenance.updatedAt).toLocaleString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MaintenancePage;
