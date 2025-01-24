import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  ThemeProvider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FuelPrint from "../components/print/FuelPrint";
import FuelPrintAll from "../components/print/FuelPrintAll";
import theme from "../css/theme";
import DescriptionIcon from "@mui/icons-material/Description";

const FuelPage = () => {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [totalFuelCapacity, setTotalFuelCapacity] = useState(0);
  const [page, setPage] = useState(0); // Page state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page state

  // State for dialog
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedFuelRecord, setSelectedFuelRecord] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const fuelResponse = await axios.get("http://localhost:5000/api/fuel", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelRecords(fuelResponse.data);

        const totalFuel = fuelResponse.data.reduce(
          (total, record) => total + record.fuelCapacity,
          0
        );
        setTotalFuelCapacity(totalFuel);

        const vehicleResponse = await axios.get(
          "http://localhost:5000/api/vehicles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVehicles(vehicleResponse.data);

        const userResponse = await axios.get(
          "http://localhost:5000/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(userResponse.data);
      } catch (error) {
        setError("Failed to fetch fuel records, vehicles, or users");
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch data from server",
          icon: "error",
        });
      }
    };
    const { role } = JSON.parse(atob(token.split(".")[1]));
    setIsAdmin(role === "admin");
    fetchData();
  }, [error]);

  const handleStatusChange = async (fuelRecordId, newStatus, currentFuelCapacity) => {
    try {
      let updatedFuelCapacity = currentFuelCapacity;

      if (newStatus === "cancel") {
        updatedFuelCapacity = 0;
      }

      await axios.put(`http://localhost:5000/api/fuel/${fuelRecordId}`, {
        status: newStatus,
        fuelCapacity: updatedFuelCapacity,
      });

      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/fuel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFuelRecords(response.data);

      const totalFuel = response.data.reduce(
        (total, record) => total + record.fuelCapacity,
        0
      );
      setTotalFuelCapacity(totalFuel);

      Swal.fire({
        title: "Success!",
        text: "อัพเดทสถานะสำเร็จ",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "ไม่สามารถอัพเดทสถานะ",
        icon: "error",
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredFuelRecords = searchQuery
    ? fuelRecords.filter((record) => {
      const user = users.find((u) => u._id === record.userId);
      return user?.selfid?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    : fuelRecords;

  const handleOpenDetailDialog = (fuelRecord) => {
    const vehicle = vehicles.find((v) => v._id === fuelRecord.vehicleId);
    const user = users.find((u) => u._id === fuelRecord.userId);

    setSelectedFuelRecord({
      ...fuelRecord,
      vehicle,
      user,
    });

    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedFuelRecord(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="mx-auto p-6 bg-white shadow-lg rounded-lg w-full font-noto">
        <h2 className="text-2xl font-bold text-center mb-6">
          ข้อมูลการเบิกเชื้อเพลิง
        </h2>
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
          <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">ยอดเชื้อเพลิง</h3>
            <p className="text-gray-600 text-2xl">
              จำนวน {totalFuelCapacity} ลิตร
            </p>
          </div>
        </div>
        <div className="mb-3">
          {isAdmin &&
            <PDFDownloadLink
              document={
                <FuelPrintAll
                  vehicles={vehicles}
                  users={users}
                  fuelRecords={fuelRecords}
                />
              }
              fileName="Fuel_all_data.pdf"
            >
              {({ loading }) => (
                <Button variant="outlined" color="primary" disabled={loading}>
                  <PictureAsPdfIcon />
                  {loading ? "กำลังโหลด..." : "ดาวน์โหลดข้อมูลทั้งหมด"}
                </Button>
              )}
            </PDFDownloadLink>
          }
          <div className="flex flex-col mb-4">
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-3"
              type="text"
              placeholder="ค้นหาตามหมายเลขประจำตัว"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
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
                {/* <TableCell align="left">ดาวน์โหลดข้อมูล</TableCell> */}
                <TableCell align="left">รายละเอียด</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFuelRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record, index) => {
                  const vehicle = vehicles.find((v) => v._id === record.vehicleId);
                  const user = users.find((u) => u._id === record.userId);
                  return (
                    <TableRow key={record._id}>
                      <TableCell align="left">{index + 1}</TableCell>
                      <TableCell align="left">
                        {vehicle ? vehicle.name : "N/A"}
                      </TableCell>
                      <TableCell align="left">
                        {vehicle ? vehicle.license_plate : "N/A"}
                      </TableCell>
                      <TableCell align="left">
                        {user ? user.selfid : "N/A"}
                      </TableCell>
                      <TableCell align="left">
                        {user ? user.name : "N/A"}
                      </TableCell>
                      <TableCell align="left">
                        {record.fuelCapacity} ลิตร{" "}
                      </TableCell>
                      <TableCell align="left">
                        {new Date(record.fuelDate).toLocaleString()}
                      </TableCell>
                      <TableCell align="left">
                        {record.status === "pending" ? (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                            <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                            รออนุมัติ
                          </span>
                        ) : record.status === "completed" ? (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                            <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                            อนุมัติแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-red-400 text-red-400">
                            <span className="w-2.5 h-2.5 mr-2 rounded-full bg-red-400"></span>
                            ยกเลิก
                          </span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="left">
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleStatusChange(
                                record._id,
                                record.status === "completed"
                                  ? "pending"
                                  : "completed",
                                record.fuelCapacity
                              )
                            }
                          >
                            {record.status === "completed"
                              ? "ยกเลิกการอนุมัติ"
                              : "อนุมัติ"}
                          </Button>
                        </TableCell>
                      )}
                      {/* <TableCell align="left">
                        <PDFDownloadLink
                          document={
                            <FuelPrint
                              fuelRecord={record}
                              vehicle={vehicle}
                              user={user}
                            />
                          }
                          fileName={`Fuel_${record._id}.pdf`}
                        >
                          {({ loading }) =>
                            loading ? "กำลังโหลด..." : "ดาวน์โหลด"
                          }
                        </PDFDownloadLink>
                      </TableCell> */}
                      <TableCell align="left">
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenDetailDialog(record)}
                        >
                          <DescriptionIcon /> แสดงรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredFuelRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>รายละเอียดการเบิกเชื้อเพลิง</DialogTitle>
        <DialogContent>
          {selectedFuelRecord && (
            <div>
              <p><strong>รถที่เบิก: </strong>{selectedFuelRecord.vehicle ? selectedFuelRecord.vehicle.name : 'ไม่พบข้อมูล'}</p>
              <p><strong>เลขทะเบียนรถ: </strong>{selectedFuelRecord.vehicle ? selectedFuelRecord.vehicle.license_plate : 'ไม่พบข้อมูล'}</p>
              <p><strong>หมายเลขประจำตัว: </strong>{selectedFuelRecord.user ? selectedFuelRecord.user.selfid : 'ไม่พบข้อมูล'}</p>
              <p><strong>ผู้เบิก: </strong>{selectedFuelRecord.user ? selectedFuelRecord.user.name : 'ไม่พบข้อมูล'}</p>
              <p><strong>จำนวนเชื้อเพลิง: </strong>{selectedFuelRecord.fuelCapacity} ลิตร</p>
              <p><strong>วันที่เบิก: </strong>{new Date(selectedFuelRecord.fuelDate).toLocaleString()}</p>
              <p><strong>สถานะ: </strong>{selectedFuelRecord.status}</p>
              <TableCell align="left">
                <PDFDownloadLink
                  document={
                    <FuelPrint
                      fuelRecord={selectedFuelRecord}
                      vehicle={selectedFuelRecord.vehicle}
                      user={selectedFuelRecord.user}
                    />
                  }
                  fileName={`Fuel_${selectedFuelRecord._id}.pdf`}
                >

                  {({ loading }) => (
                    <Button variant="outlined" color="primary" disabled={loading}>
                      <PictureAsPdfIcon />
                      {loading ? "กำลังโหลด..." : "ดาวน์โหลดข้อมูล"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </TableCell>
            </div>

          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">ปิด</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default FuelPage;
