import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  ThemeProvider
} from "@mui/material";
import HandymanIcon from "@mui/icons-material/Handyman";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import theme from '../css/theme'

const ReturnInformation = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/return", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReturns(response.data);
        const { role } = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(role === "admin");
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch return data");
        setLoading(false);
        Swal.fire({
          title: "Error",
          text: "There was an error fetching return data.",
          icon: "error",
        });
      }
    };

    fetchReturns();
  }, []);

  // ยืนยันการซ่อมบำรุง
  const handleMaintenace = async (returnId, vehicleId) => {
    try {
      const token = localStorage.getItem("token");

      // แสดง Swal เพื่อให้กรอก description สำหรับการบำรุงรักษา
      const { value: description } = await Swal.fire({
        title: "สาเหตุการซ่อมบำรุง",
        input: "textarea",
        inputPlaceholder: "ใส่รายละเอียด",
        inputAttributes: {
          "aria-label": "",
        },
        showCancelButton: true,
        confirmButtonText: "บันทึก",
        cancelButtonText: "ยกเลิก",
        inputValidator: (value) => {
          if (!value) {
            return "กรุณาใส่ข้อมูล!";
          }
        },
      });

      if (description) {
        // อัปเดตสถานะการคืนรถเป็น 'completed'
        await axios.put(
          `http://localhost:5000/api/return/${returnId}`,
          { returnStatus: "completed" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReturns((prevReturns) =>
          prevReturns.map((ret) =>
            ret._id === returnId ? { ...ret, returnStatus: "completed" } : ret
          )
        );

        // อัปเดตสถานะของรถเป็น 'available'
        await axios.put(
          `http://localhost:5000/api/vehicles/${vehicleId}`,
          { status: "maintenance" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReturns((prevReturns) =>
          prevReturns.map((ret) => {
            if (ret._id === returnId) {
              return {
                ...ret,
                vehicle: { ...ret.vehicle, status: "maintenance" },
              };
            }
            return ret;
          })
        );

        // อัปเดตข้อมูลการบำรุงรักษา
        const maintenanceData = {
          vehicleId: vehicleId,
          description: description, // คำอธิบายการบำรุงรักษาจาก Swal
        };

        await axios.post(
          "http://localhost:5000/api/maintenance",
          maintenanceData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        Swal.fire({
          title: "Success",
          text: "อัพเดทสถานะเรียบร้อย",
          icon: "success",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการพอัพเดท",
        icon: "error",
      });
    }
  };

  // ยืนยันการคืนรถ
  const handleConfirm = async (returnId, vehicleId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/return/${returnId}`,
        { returnStatus: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReturns((prevReturns) =>
        prevReturns.map((ret) =>
          ret._id === returnId ? { ...ret, returnStatus: "completed" } : ret
        )
      );

      await axios.put(
        `http://localhost:5000/api/vehicles/${vehicleId}`,
        { status: "available" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReturns((prevReturns) =>
        prevReturns.map((ret) => {
          if (ret._id === returnId) {
            return {
              ...ret,
              vehicle: { ...ret.vehicle, status: "available" },
            };
          }
          return ret;
        })
      );

      Swal.fire({
        title: "Success",
        text: "อัพเดทสถานะเรียบร้อย",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการพอัพเดท",
        icon: "error",
      });
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredReturn = returns.filter((ret) =>
    ret.user && ret.user.selfid
      ? ret.user.selfid.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ThemeProvider theme={theme}>
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg w-full font-noto">
      <h2 className="text-2xl font-bold text-center mb-6">ข้อมูลการคืนรถ</h2>
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
          <h3 className="text-xl font-semibold">ข้อมูลการคืน</h3>
          <p className="text-gray-600 text-2xl">{returns.length}</p>
        </div>
      </div>
      <div className="search-bar mb-4">
        <input
          type="text"
          placeholder="ค้นหาด้วยหมายเลขประจำตัว"
          value={searchQuery}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell align="left">ภารกิจ</TableCell>
              {isAdmin && (
                <TableCell align="left">หมายเลขประจำตัวผู้จอง</TableCell>
              )}
              <TableCell align="left">ชื่อผู้จอง</TableCell>
              <TableCell align="left">ยี่ห้อรถ</TableCell>
              <TableCell align="left">ทะเบียน</TableCell>
              <TableCell align="left">วันที่คืน</TableCell>
              <TableCell align="left">วันที่ตรวจซ่อม</TableCell>
              <TableCell align="left">สถานะ</TableCell>
              {isAdmin && <TableCell align="left">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReturn.reverse()
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ret, index) => (
                <TableRow key={ret._id}>
                  <TableCell align="left">{filteredReturn.length - (page * rowsPerPage + index)}</TableCell>
                  <TableCell align="left">{ret.mission.mission_name}</TableCell>
                  {isAdmin && (
                    <TableCell align="left">{ret.user.selfid}</TableCell>
                  )}
                  <TableCell align="left">{ret.user.name}</TableCell>
                  <TableCell align="left">{ret.vehicle.name}</TableCell>
                  <TableCell align="left">
                    {ret.vehicle.license_plate}
                  </TableCell>
                  <TableCell align="left">
                    {new Date(ret.bookingDate).toLocaleDateString(locale, dateOptions)}
                  </TableCell>
                  <TableCell align="left">
                    {new Date(ret.returnDate).toLocaleDateString(locale, dateOptions)}
                  </TableCell>
                  <TableCell align="left">
                    {ret.returnStatus === "pending" ? (
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-blue-400 text-blue-400">
                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-blue-400"></span>
                        รออนุมัติ
                      </span>
                    ) : ret.returnStatus === "completed" ? (
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-green-400 text-green-400">
                        <span className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></span>
                        สำเร็จ
                      </span>
                    ) : null}
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="left">
                      <div>
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() =>
                            handleConfirm(ret._id, ret.vehicle._id)
                          }
                          disabled={ret.returnStatus === "completed"}
                          style={{ marginRight: "10px" }} // เว้นระยะห่างระหว่างปุ่ม
                        >
                          <CheckBoxIcon />
                          พร้อมใช้งาน
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() =>
                            handleMaintenace(ret._id, ret.vehicle._id)
                          }
                          disabled={ret.returnStatus === "completed"}
                        >
                          <HandymanIcon />
                          ซ่อมบำรุง
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={returns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
    </ThemeProvider>
  );
};

export default ReturnInformation;
