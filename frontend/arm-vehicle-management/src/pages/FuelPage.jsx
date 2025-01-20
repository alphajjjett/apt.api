import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FuelPrint from '../components/print/FuelPrint';
import FuelPrintAll from '../components/print/FuelPrintAll';

const FuelPage = () => {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [totalFuelCapacity, setTotalFuelCapacity] = useState(0);
  const [page, setPage] = useState(0); // Page state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page state

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const fuelResponse = await axios.get('http://localhost:5000/api/fuel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelRecords(fuelResponse.data);

        const totalFuel = fuelResponse.data.reduce((total, record) => total + record.fuelCapacity, 0);
        setTotalFuelCapacity(totalFuel);

        const vehicleResponse = await axios.get('http://localhost:5000/api/vehicles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVehicles(vehicleResponse.data);

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
    const { role } = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(role === 'admin');
    fetchData();
  }, []);

  const handleStatusChange = async (fuelRecordId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/fuel/${fuelRecordId}`, { status: newStatus });

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fuel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFuelRecords(response.data);

      const totalFuel = response.data.reduce((total, record) => total + record.fuelCapacity, 0);
      setTotalFuelCapacity(totalFuel);

      Swal.fire({
        title: 'Success!',
        text: 'อัพเดทสถานะสำเร็จ',
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'ไม่สามารถอัพเดทสถานะ',
        icon: 'error',
      });
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.tcarget.value, 10));
    setPage(0);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg w-full">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการเบิกเชื้อเพลิง</h2>
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ยอดเชื้อเพลิง</h3>
          <p className="text-gray-600 text-2xl">จำนวน {totalFuelCapacity} ลิตร</p>
        </div>
      </div>
      <div className="mb-3">
        <PDFDownloadLink 
          document={<FuelPrintAll vehicles={vehicles} users={users} fuelRecords={fuelRecords} />} 
          fileName="AllFuel.pdf">
          {({ loading }) => (
            <Button variant="outlined" color="primary" disabled={loading}>
              <PictureAsPdfIcon/>
              {loading ? 'กำลังโหลด...' : 'ดาวน์โหลดข้อมูลทั้งหมด'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell align="left">รถที่เบิก</TableCell>
              <TableCell align="left">เลขทะเบียนรถ</TableCell>
              <TableCell align="left">หมายเลขประจำตัว</TableCell>
              <TableCell align="left">ผู้เบิก</TableCell>
              <TableCell align="left">จำนวนเชื้อเพลิง (ลิตร)</TableCell>
              <TableCell align="left">วันที่อนุมัติ</TableCell>
              <TableCell align="left">สถานะ</TableCell>
              {isAdmin && <TableCell align="left">Action</TableCell>}
              <TableCell align="left">ดาวน์โหลดข้อมูล</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fuelRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record, index) => {
              const vehicle = vehicles.find((v) => v._id === record.vehicleId);
              const user = users.find((u) => u._id === record.userId);

              return (
                <TableRow key={record._id}>
                  <TableCell align="left">{index + 1}</TableCell>
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
                  {isAdmin && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStatusChange(record._id, 'completed')}
                        disabled={record.status === 'completed'}
                      >
                        {record.status === 'completed' ? 'อนุมัติเรียบร้อย' : 'อนุมัติ'}
                      </Button>
                    </TableCell>
                  )}
                  <TableCell>
                    {record.status === 'completed' && (
                      <PDFDownloadLink
                        document={<FuelPrint record={record} vehicle={vehicle} user={user} />}
                        fileName={`Fuel_Record_${record._id}.pdf`}
                      >
                        {({ loading }) => (
                          <>
                            <Button variant="outlined" color="primary" disabled={loading}>
                              <PictureAsPdfIcon />
                              {loading ? 'กำลังโหลด...' : 'ดาวน์โหลดข้อมูล'}
                            </Button>
                          </>
                        )}
                      </PDFDownloadLink>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={fuelRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
};

export default FuelPage;
