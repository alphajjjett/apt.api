import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FuelPrint from "../components/print/FuelPrint";
import FuelPrintAll from "../components/print/FuelPrintAll";
import theme from "../css/theme";
import DescriptionIcon from "@mui/icons-material/Description";

const MySwal = withReactContent(Swal);

const FuelPage = () => {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [totalFuelCapacity, setTotalFuelCapacity] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedFuelRecord, setSelectedFuelRecord] = useState(null);
  const backend = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const fuelResponse = await axios.get(`${backend}/api/fuel`, {
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

        const vehicleResponse = await axios.get(`${backend}/api/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVehicles(vehicleResponse.data);

        const userResponse = await axios.get(`${backend}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(userResponse.data);
      } catch (error) {
        setError("ไม่สามารถเข้าถึงข้อมูล fuel , vehicles, or users");
        MySwal.fire({
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

  const handleStatusChange = async (
    fuelRecordId,
    newStatus,
    currentFuelCapacity
  ) => {
    try {
      let updatedFuelCapacity = currentFuelCapacity;

      if (newStatus === "cancel") {
        updatedFuelCapacity = 0;
      }

      await axios.put(`${backend}/api/fuel/${fuelRecordId}`, {
        status: newStatus,
        fuelCapacity: updatedFuelCapacity,
      });

      const token = localStorage.getItem("token");
      const response = await axios.get(`${backend}/api/fuel`, {
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

      MySwal.fire({
        title: "Success!",
        text: "อัพเดทสถานะสำเร็จ",
        icon: "success",
      });
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "ไม่สามารถอัพเดทสถานะ",
        icon: "error",
      });
    }
  };

  const handleDelete = async (fuelRecordId) => {
    try {
      const token = localStorage.getItem("token");

      const result = await MySwal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "ใช่, ลบข้อมูล!",
        cancelButtonText: "ยกเลิก",
      });

      if (result.isConfirmed) {
        await axios.delete(`${backend}/api/fuel/${fuelRecordId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const response = await axios.get(`${backend}/api/fuel`, {
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

        MySwal.fire({
          title: "ลบสำเร็จ!",
          text: "ข้อมูลถูกลบเรียบร้อยแล้ว",
          icon: "success",
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      MySwal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถลบข้อมูลได้",
        icon: "error",
      });
    }
  };

  const handleEditFuelCapacity = async (fuelRecordId, currentFuelCapacity) => {
    try {
      const { value: newFuelCapacity } = await Swal.fire({
        title: "แก้ไขปริมาณเชื้อเพลิงมัน",
        input: "number", // ให้ผู้ใช้ป้อนตัวเลข
        inputLabel: "ปริมาณเชื้อเพลิง (ลิตร)",
        inputValue: currentFuelCapacity, // ค่าเริ่มต้นเป็นค่าเดิมของ fuelCapacity
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value || value <= 0) {
            return "กรุณากรอกปริมาณเชื้อเพลิงที่มากกว่า 0";
          }
        },
      });

      if (newFuelCapacity) {
        await axios.put(`${backend}/api/fuel/${fuelRecordId}`, {
          fuelCapacity: newFuelCapacity,
        });

        const token = localStorage.getItem("token");
        const response = await axios.get(`${backend}/api/fuel`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelRecords(response.data);

        Swal.fire({
          title: "Success!",
          text: "แก้ไขปริมาณเชื้อเพลิงสำเร็จ",
          icon: "success",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "ไม่สามารถแก้ไขปริมาณเชื้อเพลิงได้",
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

  const dateOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  };

  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };

  const combinedOptions = { ...dateOptions, ...timeOptions };

  const locale = "th-TH";

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
          {isAdmin && (
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
              {({ loading }) =>
                loading ? (
                  <Button variant="contained" color="primary">
                    กำลังโหลด...
                  </Button>
                ) : (
                  <Button variant="contained" color="primary">
                    ดาวน์โหลดข้อมูลทั้งหมด
                  </Button>
                )
              }
            </PDFDownloadLink>
          )}
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
                <TableCell align="left">วันที่และเวลาที่อนุมัติ</TableCell>
                <TableCell align="left">สถานะ</TableCell>
                {isAdmin && <TableCell align="left">Action</TableCell>}
                {/* <TableCell align="left">ดาวน์โหลดข้อมูล</TableCell> */}
                <TableCell align="left">รายละเอียด</TableCell>
                <TableCell align="left">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFuelRecords
                .slice()
                .reverse()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record, index) => {
                  const vehicle = vehicles.find(
                    (v) => v._id === record.vehicleId
                  );
                  const user = users.find((u) => u._id === record.userId);
                  const loggedInUserSelfid = JSON.parse(
                    atob(localStorage.getItem("token")?.split(".")[1])
                  ).selfid;
                  const isCurrentUser = user?.selfid === loggedInUserSelfid;

                  return (
                    <TableRow key={record._id}>
                      <TableCell align="left">
                        {filteredFuelRecords.length -
                          (page * rowsPerPage + index)}
                      </TableCell>
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
                        {new Date(record.fuelDate).toLocaleString(
                          locale,
                          combinedOptions
                        )}
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
                        <TableCell>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleStatusChange(record._id, "completed")
                            }
                            disabled={
                              record.status === "completed" ||
                              record.status === "cancel"
                            }
                          >
                            {record.status === "completed"
                              ? "อนุมัติเรียบร้อย"
                              : "อนุมัติ"}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                              handleStatusChange(record._id, "cancel")
                            }
                            disabled={
                              record.status === "cancel" ||
                              record.status === "completed"
                            }
                            style={{ marginLeft: "10px" }}
                          >
                            {record.status === "completed"
                              ? "ไม่อนุมัติ"
                              : "ไม่อนุมัติ"}
                          </Button>
                        </TableCell>
                      )}
                      {(isAdmin || isCurrentUser) && (
                        <TableCell align="left">
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenDetailDialog(record)}
                          >
                            <DescriptionIcon /> แสดงรายละเอียด
                          </Button>
                        </TableCell>
                      )}
                      {(isAdmin || isCurrentUser) && (
                        <TableCell align="left">
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(record._id)}
                            disabled={
                              (record.status === "cancel" ||
                                record.status === "completed") &&
                              !isAdmin
                            }
                          >
                            <DeleteIcon /> ลบข้อมูล
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              handleEditFuelCapacity(
                                record._id,
                                record.fuelCapacity
                              )
                            }
                            disabled={
                              (record.status === "cancel" ||
                                record.status === "completed") &&
                              !isAdmin
                            }
                          >
                            <EditIcon /> แก้ไข
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
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
              <p>
                <strong>รถที่เบิก: </strong>
                {selectedFuelRecord.vehicle
                  ? selectedFuelRecord.vehicle.name
                  : "ไม่พบข้อมูล"}
              </p>
              <p>
                <strong>เลขทะเบียนรถ: </strong>
                {selectedFuelRecord.vehicle
                  ? selectedFuelRecord.vehicle.license_plate
                  : "ไม่พบข้อมูล"}
              </p>
              <p>
                <strong>หมายเลขประจำตัว: </strong>
                {selectedFuelRecord.user
                  ? selectedFuelRecord.user.selfid
                  : "ไม่พบข้อมูล"}
              </p>
              <p>
                <strong>ผู้เบิก: </strong>
                {selectedFuelRecord.user
                  ? selectedFuelRecord.user.name
                  : "ไม่พบข้อมูล"}
              </p>
              <p>
                <strong>จำนวนเชื้อเพลิง: </strong>
                {selectedFuelRecord.fuelCapacity} ลิตร
              </p>
              <p>
                <strong>วันที่เบิก: </strong>
                {new Date(selectedFuelRecord.fuelDate).toLocaleDateString(
                  locale,
                  dateOptions
                )}
              </p>
              <p>
                <strong>สถานะ: </strong>
                {selectedFuelRecord.status}
              </p>
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
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
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
          <Button onClick={handleCloseDetailDialog} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default FuelPage;
