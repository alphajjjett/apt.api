import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TablePagination,
  ThemeProvider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import EditIcon from "@mui/icons-material/Edit";
import TodayIcon from "@mui/icons-material/Today";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Modal from "react-bootstrap/Modal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BookingPrint from "../components/print/BookingPrint";
import theme from "../css/theme";

const MySwal = withReactContent(Swal);

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [updatedMission, setUpdatedMission] = useState({});
  const [isRequesting, setIsRequesting] = useState(false); // เบิกน้ำมัน
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const fetchMissions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/missions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedMission(response.data);
        setUpdatedMission(response.data);
        setMissions(response.data);
      } catch (error) {
        setError("Failed to fetch missions");
      } finally {
        setLoading(false);
      }
    };

    const { role } = JSON.parse(atob(token.split(".")[1])); // decode JWT
    setIsAdmin(role === "admin");
    fetchMissions();
  }, [navigate]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vehicles");
        const availableVehicles = response.data.filter(
          (vehicle) => vehicle.status === "available"
        );
        setVehicles(availableVehicles);
      } catch (error) {
        setError("Failed to fetch vehicles");
      }
    };
    fetchVehicles();
  }, []);

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find((v) => v._id === vehicleId);
    setSelectedVehicle(vehicle);
    setShowModal(false);
  };

  const handleFuelRequestClick = (mission) => {
    Swal.fire({
      title: "เบิกเชื้อเพลิง",
      input: "number",
      inputLabel: "จำนวน(ลิตร)",
      inputAttributes: {
        min: 0, // จำนวนเชื้อเพลิงไม่ต่ำกว่า 0
      },
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      preConfirm: (fuelCapacity) => {
        if (!fuelCapacity || fuelCapacity <= 0) {
          Swal.showValidationMessage("Please enter a valid fuel capacity");
          return false;
        }

        const fuelData = {
          userId: mission.assigned_user_id._id, // ส่ง userId แทน name
          vehicleId: mission.assigned_vehicle_id._id, // ส่ง vehicleId แทน name
          fuelCapacity: fuelCapacity, // จำนวนเชื้อเพลิงที่กรอก
          fuelDate: new Date(mission.start_date), // ใช้วันที่ของ mission
          status: "pending",
        };

        const token = localStorage.getItem("token");

        return axios
          .post(`http://localhost:5000/api/fuel/${mission._id}`, fuelData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            Swal.fire({
              title: "Fuel Request Success",
              text: "เบิกเชื้อเพลิงสำเร็จ",
              icon: "success",
            }).then(() => {
              handleGoToFuel(); // เพิ่มฟังก์ชันนี้เพื่อไปที่หน้า FuelPage หลังจากการทำรายการเสร็จ
            });
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
              title: "Error",
              text: "เกิดข้อผิดพลาดในกาเบิกเชื้อเพลิง",
              icon: "error",
            });
          });
      },
    });
  };

  const handleReturnClick = (mission) => {
    const returnData = {
      user: mission.assigned_user_id.name,
      vehicle: mission.assigned_vehicle_id.name,
      licensePlate: mission.assigned_vehicle_id.license_plate,
      bookingDate: mission.start_date,
      returnDate: new Date(),
      returnStatus: "pending",
      description: "",
    };
    const token = localStorage.getItem("token");
    console.log("Return Data:", returnData);
    console.log("Mission ID:", mission._id);

    axios
      .post(`http://localhost:5000/api/return/${mission._id}`, returnData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Return Success:", response.data);
        Swal.fire({
          title: "Return Success",
          text: "คืนรถสำเร็จ",
          icon: "success",
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "เกิดข้อผิดพลาดในการคืนรถ",
          icon: "error",
        }).finally(() => {
          setIsRequesting(false); // คืนสถานะปุ่มเมื่อการดำเนินการเสร็จสิ้น
        });
      });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleStatusChange = async (missionId, newStatus) => {
    const token = localStorage.getItem("token");
    const { selfid } = JSON.parse(atob(token.split(".")[1])); // decode token to get selfid of the logged-in user

    const missionToUpdate = missions.find(
      (mission) => mission._id === missionId
    );

    // Check if the current user is the assigned user or an admin
    if (missionToUpdate.assigned_user_id?.selfid !== selfid && !isAdmin) {
      MySwal.fire({
        title: "Not Authorized",
        text: "You are not authorized to change the status of this mission.",
        icon: "error",
      });
      return;
    }

    try {
      // Update mission status
      await axios.put(
        `http://localhost:5000/api/missions/${missionId}/status`,
        {
          status: newStatus,
        }
      );

      // If status is completed or in-progress, update the vehicle status to in-use
      if (newStatus === "completed" || newStatus === "in-progress") {
        if (missionToUpdate.assigned_vehicle_id) {
          const vehicleId = missionToUpdate.assigned_vehicle_id._id;
          await axios.put(`http://localhost:5000/api/vehicles/${vehicleId}`, {
            status: "in-use",
          });
        }
      } else if (newStatus === "cancel") {
        if (missionToUpdate.assigned_vehicle_id) {
          const vehicleId = missionToUpdate.assigned_vehicle_id._id;
          await axios.put(`http://localhost:5000/api/vehicles/${vehicleId}`, {
            status: "available",
          });
        }
      }

      // Update the missions state
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission._id === missionId
            ? { ...mission, status: newStatus }
            : mission
        )
      );

      Swal.fire({
        title: "Success!",
        text: "อัพเดทสถานะสำเร็จ",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Failed to update mission status");

      Swal.fire({
        title: "Error!",
        text: "เกิดข้อผิดพลาดในการอัพเดทสถานะ",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (missionId) => {
    const token = localStorage.getItem("token");
    const { selfid } = JSON.parse(atob(token.split(".")[1])); // decode token to get selfid of the logged-in user

    // Find the mission that we are about to delete
    const missionToDelete = missions.find(
      (mission) => mission._id === missionId
    );

    // Check if the mission is assigned to the current user or if the user is admin
    if (missionToDelete.assigned_user_id?.selfid !== selfid && !isAdmin) {
      MySwal.fire({
        title: "Not Authorized",
        text: "You are not authorized to delete this mission.",
        icon: "error",
      });
      return;
    }

    // If authorized, show the confirmation dialog
    MySwal.fire({
      title: "Are you sure?",
      text: "ไม่สามารถกู้ข้อมูลกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          await axios.delete(
            `http://localhost:5000/api/missions/${missionId}`,
            config
          );
          setMissions(missions.filter((mission) => mission._id !== missionId)); // Remove the deleted mission from the state

          MySwal.fire({
            title: "Deleted!",
            text: "ข้อมูลถูกลบเรียบร้อย",
            icon: "success",
          });
        } catch (error) {
          MySwal.fire({
            title: "Error",
            text: "เกิดข้อผิดพลาดในการลบข้อมูล",
            icon: "error",
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancel",
          text: "ยกเลิกการลบ",
          icon: "error",
        });
      }
    });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredMissions = missions.filter((mission) => {
    const selfid = mission.assigned_user_id?.selfid || ""; // Fallback to an empty string if selfid is undefined
    return selfid.includes(searchQuery);
  });

  const handleGoToFuel = () => {
    navigate("/fuel"); // เปลี่ยนไปที่หน้า fuel
  };

  const handleGoToReturn = () => {
    navigate("/return"); // เปลี่ยนไปที่หน้า fuel
  };

  const handleEditClick = (mission) => {
    const token = localStorage.getItem("token");
    const { selfid } = JSON.parse(atob(token.split(".")[1])); // get logged-in user's selfid

    // Check if the logged-in user is the same as the assigned user for this mission
    if (mission.assigned_user_id.selfid !== selfid && !isAdmin) {
      MySwal.fire({
        title: "Not Authorized",
        text: "You can only edit your own missions.",
        icon: "error",
      });
      return;
    }

    setSelectedMission(mission);
    setUpdatedMission({
      mission_name: mission.mission_name,
      description: mission.description,
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setUpdatedMission({ ...updatedMission, [name]: value });
  };

  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const updatedMissionWithVehicle = {
        ...updatedMission,
        assigned_vehicle_id: selectedVehicle
          ? selectedVehicle._id
          : selectedMission.assigned_vehicle_id._id,
      };

      // ส่งข้อมูลที่อัปเดตไปยังเซิร์ฟเวอร์
      await axios.put(
        `http://localhost:5000/api/missions/${selectedMission._id}`,
        updatedMissionWithVehicle,
        config
      );

      // อัปเดตสถานะของ mission ใน state พร้อมกับ assigned_vehicle_id ใหม่
      setMissions(
        missions.map((mission) =>
          mission._id === selectedMission._id
            ? {
                ...mission,
                ...updatedMissionWithVehicle,
                assigned_vehicle_id: selectedVehicle,
              } // อัปเดตข้อมูลรถด้วย
            : mission
        )
      );

      // แสดงการแจ้งเตือนการอัปเดตสำเร็จ
      MySwal.fire({
        title: "Updated!",
        text: "Your mission has been updated.",
        icon: "success",
      });

      setEditDialogOpen(false);
    } catch (error) {
      MySwal.fire({
        title: "Error",
        text: "There was an error updating the mission.",
        icon: "error",
      });
    }
  };

  if (loading) return <p>Loading missions...</p>;

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className=" mx-auto p-6 bg-white shadow-lg rounded-lg w-full font-noto">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการจองรถ</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ยอดการจองรถ</h3>
          <p className="text-gray-600 text-2xl">{missions.length} คัน</p>
        </div>
      </div>
      <ThemeProvider theme={theme}>
        {/* Search box */}
        <TextField
          label="ค้นหาด้วย หมายเลขประจำตัว"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          style={{ marginBottom: "20px" }}
        />

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="mission table">
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>ภารกิจ</TableCell>
                {/* <TableCell align="left">Description</TableCell> */}
                {isAdmin && <TableCell align="left">หมายเลขประจำตัว</TableCell>}
                <TableCell align="left">ชื่อผู้จอง</TableCell>
                <TableCell align="left">วันที่จอง</TableCell>
                <TableCell align="left">วันที่คืน</TableCell>
                <TableCell align="left">รถที่จอง</TableCell>
                <TableCell align="left">สถานะ</TableCell>
                <TableCell align="left">อัพเดทล่าสุด</TableCell>
                {isAdmin && <TableCell align="left">เปลี่ยนสถานะ</TableCell>}
                {/* เพิ่มการตรวจสอบเงื่อนไข assigned_user_id.selfid ด้วย */}
                {(isAdmin ||
                  filteredMissions.some(
                    (mission) =>
                      mission.assigned_user_id?.selfid ===
                      JSON.parse(
                        atob(localStorage.getItem("token")?.split(".")[1])
                      ).selfid
                  )) && <TableCell align="left">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMissions.reverse()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((mission, index) => (
                  <TableRow key={mission._id}>
                    <TableCell align="left">{index + 1}</TableCell>
                    <TableCell component="th" scope="row">
                      {mission.mission_name}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="left">
                        {mission.assigned_user_id
                          ? mission.assigned_user_id.selfid
                          : "N/A"}
                      </TableCell>
                    )}
                    <TableCell align="left">
                      {mission.assigned_user_id
                        ? mission.assigned_user_id.name
                        : "N/A"}
                    </TableCell>
                    <TableCell align="left">
                      {new Date(mission.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="left">
                      {new Date(mission.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="left">
                      {mission.assigned_vehicle_id?.name || "N/A"}(
                      {mission.assigned_vehicle_id?.license_plate || "N/A"})
                    </TableCell>
                    <TableCell align="left">
                      {mission.status === "pending" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                          รออนุมัติ
                        </span>
                      ) : mission.status === "in-progress" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-orange-400 text-orange-400">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-orange-400"></span>
                          อยู่ระหว่างภารกิจ
                        </span>
                      ) : mission.status === "completed" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                          อนุมัติ
                        </span>
                      ) : mission.status === "cancel" ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-red-600 text-red-600">
                          <span className="w-2.5 h-2.5 mr-2 rounded-full bg-red-600"></span>
                          ไม่อนุมัติ
                        </span>
                      ) : null}
                    </TableCell>

                    <TableCell align="left">
                      {new Date(mission.updatedAt).toLocaleString()}
                    </TableCell>

                    {/* Show the status dropdown if the user is an admin */}
                    {isAdmin && (
                      <TableCell align="left">
                        <Button
                          onClick={() => {
                            handleStatusChange(mission._id, "in-progress"); // เปลี่ยนสถานะเป็น in-progress
                          }}
                          variant="contained"
                          color="primary"
                          disabled={
                            mission.status === "completed" ||
                            mission.status === "in-progress" ||
                            mission.status === "cancel"
                          } // disabled ถ้าสถานะเป็น completed หรือ in-progress
                        >
                          {mission.status === "in-progress"
                            ? "อนุมัติเรียบร้อย"
                            : "อนุมัติ"}
                        </Button>
                        <Button
                          onClick={() => {
                            handleStatusChange(mission._id, "cancel"); // เปลี่ยนสถานะเป็น cancel
                          }}
                          variant="contained"
                          color="error"
                          disabled={
                            mission.status === "completed" ||
                            mission.status === "in-progress" ||
                            mission.status === "cancel"
                          } // disabled ถ้าสถานะเป็น completed หรือ in-progress
                          style={{ marginLeft: "10px" }}
                        >
                          {mission.status === "cancel"
                            ? "ไม่อนุมัติ"
                            : "ไม่อนุมัติ"}
                        </Button>
                      </TableCell>
                    )}

                    {/* Show edit/delete actions based on admin or assigned user permissions */}
                    {(isAdmin ||
                      mission.assigned_user_id?.selfid ===
                        JSON.parse(
                          atob(localStorage.getItem("token").split(".")[1])
                        ).selfid) && (
                      <TableCell align="left">
                        {/* รายละเอียด */}
                        <IconButton
                          edge="end"
                          color="info"
                          style={{ marginRight: "2px" }}
                          onClick={() => handleEditClick(mission)}
                          // disabled={mission.status !== 'pending' && !isAdmin}
                        >
                          <DescriptionIcon />
                        </IconButton>

                        {/* ลบข้อมูล */}
                        <IconButton
                          edge="end"
                          color="error"
                          style={{ marginRight: "2px" }}
                          onClick={() => handleDelete(mission._id)}
                          disabled={mission.status !== "pending" && !isAdmin}
                        >
                          <DeleteIcon />
                        </IconButton>

                        <IconButton
                          edge="end"
                          color="secondary"
                          style={{ marginRight: "2px" }}
                          disabled={
                            isRequesting ||
                            mission.status === "in-progress" ||
                            mission.status === "completed" ||
                            mission.status === "cancel"
                          }
                          onClick={() => {
                            handleFuelRequestClick(mission);
                          }}
                        >
                          <LocalGasStationIcon />
                          {isRequesting}
                        </IconButton>

                        {/* แสดงปุ่มคืนรถเมื่อวันที่ปัจจุบันถึง end_date */}
                        {isAdmin &&
                          new Date() >= new Date(mission.end_date) && (
                            <IconButton
                              variant="outlined"
                              color="success"
                              style={{ marginRight: "2px" }}
                              onClick={() => {
                                handleReturnClick(mission);
                                handleGoToReturn();
                              }}
                              disabled={
                                mission.status === "completed" ||
                                mission.status === "cancel" ||
                                (!isAdmin && mission.status !== "pending")
                              }
                            >
                              <TodayIcon />
                            </IconButton>
                          )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={missions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setIsEditing(false);
          }}
          maxWidth="sm" // กำหนดขนาดให้กว้างขึ้น (เช่น 'sm', 'md', 'lg', 'xl')
          fullWidth // ทำให้ Dialog ใช้พื้นที่เต็ม width ของ container
        >
          {/* Title ของข้อมูลภารกิจ */}
          <DialogTitle
            style={{
              position: "relative",
              fontSize: "30px",
              textAlign: "center",
            }}
          >
            ข้อมูลการจอง
            {/* IconButton สำหรับการแก้ไข */}
            <DialogActions
              style={{
                padding: "0 20px 20px",
                position: "absolute",
                right: 0,
                top: 0,
                marginTop: "10px",
              }}
            >
              <IconButton
                onClick={() => setIsEditing(!isEditing)}
                edge="end"
                color="primary"
                disabled={
                  (selectedMission.status === "in-progress" ||
                    selectedMission.status === "completed") &&
                  !isAdmin
                }
              >
                <EditIcon />
              </IconButton>
            </DialogActions>
          </DialogTitle>

          <DialogContent sx={{ fontFamily: "Noto Sans Thai, sans-serif" }}>
            {selectedMission && (
              <div>
                <p>
                  <strong>ภารกิจ:</strong> {selectedMission.mission_name}
                </p>
                <p>
                  <strong>รายละเอียดภารกิจ:</strong>{" "}
                  {selectedMission.description}
                </p>
                <p>
                  <strong>ผู้จอง:</strong>{" "}
                  {selectedMission.assigned_user_id?.name || "N/A"}
                </p>
                <p>
                  <strong>วันที่จอง:</strong>{" "}
                  {new Date(selectedMission.start_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>วันที่คืน:</strong>{" "}
                  {new Date(selectedMission.end_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>ยี่ห้อรถ:</strong>{" "}
                  {selectedMission.assigned_vehicle_id?.name || "N/A"} (
                  {selectedMission.assigned_vehicle_id?.license_plate || "N/A"})
                </p>
                <p>
                  <strong>ประเภทเชื้อเพลิง:</strong>{" "}
                  {selectedMission.assigned_vehicle_id?.fuel_type || "N/A"}
                </p>

                {/* เพิ่ม PDFDownloadLink ที่นี่ */}
                <PDFDownloadLink
                  document={
                    <BookingPrint
                      mission={selectedMission} // ส่ง mission เดี่ยวๆ
                      vehicle={selectedMission}
                      user={selectedMission}
                    />
                  }
                  fileName={`Mission_.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? "กำลังโหลด..." : "ดาวน์โหลดข้อมูล"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            )}
          </DialogContent>
          {/* ฟอร์มแก้ไขข้อมูลการจอง */}
          {isEditing && (
            <>
              <DialogTitle>แก้ไขข้อมูลการจอง</DialogTitle>
              <DialogContent>
                <div style={{ padding: "5px 0" }}>
                  <TextField
                    label="ชื่อภารกิจ"
                    variant="outlined"
                    fullWidth
                    name="mission_name"
                    value={updatedMission.mission_name || ""}
                    onChange={handleEditChange}
                    style={{ marginBottom: "20px" }}
                  />

                  <TextField
                    label="รายละเอียดภารกิจ"
                    variant="outlined"
                    fullWidth
                    name="description"
                    value={updatedMission.description || ""}
                    onChange={handleEditChange}
                    style={{ marginBottom: "20px" }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowModal(true)}
                    fullWidth
                  >
                    {selectedVehicle
                      ? `${selectedVehicle.name} (${selectedVehicle.license_plate})`
                      : "เปลี่ยนรถ"}
                  </Button>
                </div>
              </DialogContent>

              {/* ปุ่มบันทึก และแก้ไขข้อมูลการจอง (ให้อยู่ข้างกัน) */}
              <DialogActions
                style={{
                  padding: "0 20px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  onClick={() => {
                    setEditDialogOpen(false);
                    setIsEditing(false);
                  }}
                  color="error"
                  variant="contained"
                  style={{
                    width: "100%",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  ปิด
                </Button>

                <Button
                  onClick={handleSubmitEdit}
                  color="success"
                  variant="contained"
                  style={{
                    width: "100%",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  บันทึก
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal for vehicle selection */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
          style={{ zIndex: 3000 }}
        >
          <Modal.Header closeButton>
            <Modal.Title>เลือกรถ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="border border-gray-300 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                  onClick={() => handleVehicleSelect(vehicle._id)}
                >
                  <div className="font-bold text-lg">{vehicle.name}</div>
                  <div className="text-sm text-gray-500">
                    รุ่น: {vehicle.model}
                  </div>
                  <div className="text-sm text-gray-500">
                    ทะเบียน: {vehicle.license_plate}
                  </div>
                  <div className="text-sm text-gray-500">
                    เชื้อเพลิง: {vehicle.fuel_type}
                  </div>
                  {/* <div className="text-sm text-gray-500">ข้อมูลซ่อมบำรุงล่าสุด: {vehicle.description}</div> */}
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={() => {
                setShowModal(false);
              }}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              ยกเลิก
            </button>
          </Modal.Footer>
        </Modal>
      </ThemeProvider>
    </div>
  );
};

export default MissionList;
