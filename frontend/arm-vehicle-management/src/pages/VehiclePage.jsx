import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ThemeProvider,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  CircularProgress,
  Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "../css/theme";
const MySwal = withReactContent(Swal);

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [updatedVehicle, setUpdatedVehicle] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const backend = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${backend}/api/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
      } catch (error) {
        setError("Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    const { role } = JSON.parse(atob(token.split(".")[1]));
    setIsAdmin(role === "admin");
    fetchVehicles();
  }, [navigate]);

  const handleDelete = async (vehicleId) => {
    const token = localStorage.getItem("token");
    MySwal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ไม่สามารถกู้คืนข้อมูลได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูล!",
      cancelButtonText: "ยกเลิก!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${backend}/api/vehicles/${vehicleId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleId));
          MySwal.fire("ลบสำเร็จ!", "ข้อมูลรถถูกลบแล้ว.", "success");
        } catch (error) {
          MySwal.fire(
            "Error",
            "There was an error deleting the vehicle.",
            "error"
          );
        }
      }
    });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setUpdatedVehicle({
      name: vehicle.name,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      fuel_type: vehicle.fuel_type,
      // description: vehicle.description,
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setUpdatedVehicle({ ...updatedVehicle, [name]: value });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backend}/api/vehicles/${selectedVehicle._id}`,
        updatedVehicle,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle._id === selectedVehicle._id
            ? { ...vehicle, ...updatedVehicle }
            : vehicle
        )
      );
      MySwal.fire("อัพเดทสำเร็จ!", "แก้ไขข้อมูลสำเร็จ", "success");
      setEditDialogOpen(false);
    } catch (error) {
      MySwal.fire("Error", "There was an error updating the vehicle.", "error");
    }
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${backend}/api/vehicles/${vehicleId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle._id === vehicleId
            ? { ...vehicle, status: newStatus }
            : vehicle
        )
      );

      // แสดงการแจ้งเตือนสำเร็จ
      Swal.fire({
        title: "สำเร็จ",
        text: `แก้ไขสถานะเป็น ${newStatus} เรียบร้อย.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Failed to update vehicle status");

      // แสดงการแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        title: "Error",
        text: "There was an issue updating the vehicle status.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg font-noto">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลรถ</h2>
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">จำนวนรถ</h3>
          <p className="text-gray-600 text-2xl">{vehicles.length} คัน</p>
        </div>
      </div>
      <ThemeProvider theme={theme}>
        {/* Search box */}
        <TextField
          label="ค้นหา โดย เลขทะเบียนรถ"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          style={{ marginBottom: "20px" }}
        />

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="vehicle table">
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>ยี่ห้อรถ</TableCell>
                <TableCell align="left">รุ่น</TableCell>
                <TableCell align="left">เลขทะเบียนรถ</TableCell>
                <TableCell align="left">ประเภทเชื้อเพลง</TableCell>
                <TableCell align="left">สถานะ</TableCell>
                {isAdmin && <TableCell align="left">เปลี่ยนสถานะ</TableCell>}
                {isAdmin && <TableCell align="left">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.reverse()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle, index) => (
                  <TableRow key={vehicle._id}>
                    <TableCell align="left">{filteredVehicles.length - (page * rowsPerPage + index)}</TableCell>
                    <TableCell component="th" scope="row">
                      {vehicle.name}
                    </TableCell>
                    <TableCell align="left">{vehicle.model}</TableCell>
                    <TableCell align="left">{vehicle.license_plate}</TableCell>
                    <TableCell align="left">{vehicle.fuel_type}</TableCell>
                    <TableCell align="left">
                      {vehicle.status === "maintenance" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                          ซ่อมบำรุง
                        </span>
                      ) : vehicle.status === "in-use" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-orange-400 text-orange-400">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-orange-400"></span>
                          อยู่ระหว่างการใช้งาน
                        </span>
                      ) : vehicle.status === "available" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                          พร้อมใช้งาน
                        </span>
                      ) : null}
                    </TableCell>
                    {isAdmin && (
                      <>
                        <TableCell align="left">
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleStatusChange(vehicle._id, "available")
                            }
                            disabled={vehicle.status === "available"}
                          >
                            พร้อมใช้งาน
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleStatusChange(vehicle._id, "maintenance")
                            }
                            disabled={vehicle.status === "maintenance"}
                            style={{ marginLeft: "10px" }}
                          >
                            ซ่อมบำรุง
                          </Button>
                        </TableCell>
                        <TableCell align="left">
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditClick(vehicle)}
                            style={{ marginRight: "10px" }}
                          >
                            <EditIcon />
                            แก้ไขข้อมูลรถ
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(vehicle._id)}
                          >
                            <DeleteIcon />
                            ลบข้อมูล
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={vehicles.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
        {/* Edit Dialog */}
        {isAdmin && (
          <Dialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
          >
            <DialogTitle>แก้ไขข้อมูลรถ</DialogTitle>
            <DialogContent dividers>
              <TextField
                label="ยี่ห้อรถ"
                name="name"
                value={updatedVehicle.name}
                onChange={handleEditChange}
                fullWidth
                margin="dense" // เพิ่ม margin ให้มีระยะห่างระหว่าง fields
              />
              <TextField
                label="รุ่น"
                name="model"
                value={updatedVehicle.model}
                onChange={handleEditChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="หมายเลขทะเบียน"
                name="license_plate"
                value={updatedVehicle.license_plate}
                onChange={handleEditChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="ประเภทเชื้อเพลิง"
                name="fuel_type"
                value={updatedVehicle.fuel_type}
                onChange={handleEditChange}
                fullWidth
                margin="dense"
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setEditDialogOpen(false)}
                color="secondary"
              >
                ยกเลิก
              </Button>
              <Button onClick={handleSubmitEdit} color="primary">
                บักทึก
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </ThemeProvider>
    </div>
  );
};

export default VehicleList;
