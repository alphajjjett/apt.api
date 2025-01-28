import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrintMaintenance from "../components/print/MaintenancePrintAll";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import EditIcon from "@mui/icons-material/Edit";
import theme from "../css/theme";

const MySwal = withReactContent(Swal);

const MaintenancePage = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false); // เปิด Modal
  const [editDescription, setEditDescription] = useState(""); // ข้อมูล description ที่จะถูกแก้ไข
  const [currentMaintenanceId, setCurrentMaintenanceId] = useState(null); // บันทึก id ของการซ่อมบำรุงที่กำลังแก้ไข
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === "admin");
    } catch (err) {
      setError("Failed to decode token");
    }

    const fetchMaintenance = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/maintenance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMaintenanceRecords(response.data);
      } catch (error) {
        setError("Failed to fetch maintenance records");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditDescription = (maintenanceId, description) => {
    setEditDescription(description);
    setCurrentMaintenanceId(maintenanceId);
    setEditModalOpen(true);
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/maintenance/${currentMaintenanceId}`,
        { description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMaintenanceRecords((prevRecords) =>
        prevRecords.map((record) =>
          record._id === currentMaintenanceId
            ? { ...record, description: editDescription }
            : record
        )
      );

      setEditModalOpen(false);
      MySwal.fire({
        title: "Success",
        text: "อัพเดทข้อมูลซ่อมบำรุงเรียบร้อย",
        icon: "success",
      });
    } catch (error) {
      MySwal.fire({
        title: "Error",
        text: "ไม่สามารถอัพเดทข้อมูลซ่อมบำรุงได้",
        icon: "error",
      });
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = maintenanceRecords.filter((maintenance) =>
    maintenance.vehicleId
      ? maintenance.vehicleId.license_plate
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : false
  );

  const dateOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  };

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  const combinedOptions = { ...dateOptions, ...timeOptions };

  const locale = 'th-TH';

  if (loading) return <p>Loading maintenance data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ThemeProvider theme={theme}>
      <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg font-noto">
        <h2 className="text-2xl font-bold text-center mb-6">
          ข้อมูลการซ่อมบำรุง
        </h2>
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
          <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">ยอดการซ่อมบำรุง</h3>
            <p className="text-gray-600 text-2xl">
              {maintenanceRecords.length} คัน
            </p>
          </div>
        </div>
        {/* ปุ่มดาวน์โหลด PDF */}
        {isAdmin && (
          <div className="mb-3">
            <Button variant="outlined" color="primary">
              <PDFDownloadLink
                document={<PrintMaintenance maintenance={maintenanceRecords} />}
                fileName="Maintenance_Report.pdf"
              >
                ดาวน์โหลดข้อมูลทั้งหมด
              </PDFDownloadLink>
            </Button>
          </div>
        )}
        <div className="flex flex-col mb-4">
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-3"
            type="text"
            placeholder="ค้นหาด้วยหมายเลขทะเบียน"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="maintenance table">
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>ยี่ห้อรถ</TableCell>
                <TableCell align="right">รุ่น</TableCell>
                <TableCell align="right">ทะเบียน</TableCell>
                <TableCell align="right">รายละเอียดการซ่อมบำรุง</TableCell>
                {isAdmin && <TableCell align="right">สถานะของรถ</TableCell>}
                <TableCell align="left">วันที่ / เวลา</TableCell>
                {isAdmin && <TableCell align="right">แก้ไข</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.reverse()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((maintenance, index) => (
                  <TableRow key={maintenance._id}>
                    <TableCell align="left">{filteredData.length - (page * rowsPerPage + index)}</TableCell>
                    <TableCell component="th" scope="row">
                      {maintenance.vehicleId
                        ? maintenance.vehicleId.name
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {maintenance.vehicleId
                        ? maintenance.vehicleId.model
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {maintenance.vehicleId
                        ? maintenance.vehicleId.license_plate
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {maintenance.description || "N/A"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        {isAdmin && maintenance.vehicleId ? (
                          maintenance.vehicleId.status === "maintenance" ? (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                              <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                              ซ่อมบำรุง
                            </span>
                          ) : maintenance.vehicleId.status === "in-use" ? (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-orange-400 text-orange-400">
                              <span className="w-2.5 h-2.5 mr-2 rounded-full bg-orange-400"></span>
                              อยู่ระหว่างการใช้งาน
                            </span>
                          ) : maintenance.vehicleId.status === "available" ? (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                              <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                              พร้อมใช้งาน
                            </span>
                          ) : null
                        ) : null}
                      </TableCell>
                    )}
                    <TableCell align="left">
                      {maintenance.updatedAt
                        ? new Date(maintenance.updatedAt).toLocaleString(locale, combinedOptions)
                        : "N/A"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={() =>
                            handleEditDescription(
                              maintenance._id,
                              maintenance.description
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={maintenanceRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Modal สำหรับแก้ไขข้อมูล description */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <DialogTitle>แก้ไขรายละเอียดการซ่อมบำรุง</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="รายละเอียดการซ่อมบำรุง"
              type="text"
              fullWidth
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)} color="secondary">
              ยกเลิก
            </Button>
            <Button onClick={handleSaveDescription} color="primary">
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default MaintenancePage;
