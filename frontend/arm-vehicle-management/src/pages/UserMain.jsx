import React, { useState } from "react";
import { Button, Grid, Typography, Card, CardContent,ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import HandymanIcon from "@mui/icons-material/Handyman";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import DescriptionIcon from "@mui/icons-material/Description";
import TodayIcon from "@mui/icons-material/Today";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import dayjs from "dayjs";
import theme from '../css/theme'

const UserMain = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg w-full max-w-7xl">
      <ThemeProvider theme={theme}>
      <Grid container spacing={4}>
        {/* การจองรถ */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h2" sx={{ marginBottom: 2 }}>
            ส่วนการจองรถ
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/missions")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 50, marginRight: 2 }} />
                เริ่มการจองรถ
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/missionslist")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  backgroundColor: "#ff9800",
                  "&:hover": { backgroundColor: "#f57c00" },
                }}
              >
                <EventAvailableIcon sx={{ fontSize: 50, marginRight: 2 }} />
                ข้อมูลการจองรถ
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* ข้อมูล */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h2" sx={{ marginBottom: 2 }}>
            ข้อมูล
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/vehicle")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  backgroundColor: "#2196f3",
                  "&:hover": { backgroundColor: "#1976d2" },
                }}
              >
                <DescriptionIcon sx={{ fontSize: 50, marginRight: 2 }} />{" "}
                ข้อมูลรถ
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/maintenance")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  backgroundColor: "#f44336",
                  "&:hover": { backgroundColor: "#d32f2f" },
                }}
              >
                <HandymanIcon sx={{ fontSize: 50, marginRight: 2 }} />{" "}
                ข้อมูลการซ่อมบำรุง
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/fuel")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  "&:hover": { backgroundColor: "#fbc02d" },
                }}
              >
                <LocalGasStationIcon sx={{ fontSize: 50, marginRight: 2 }} />
                ข้อมูลการเบิกเชื้อเพลิง
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/return")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  backgroundColor: "#9c27b0",
                  "&:hover": { backgroundColor: "#7b1fa2" },
                }}
              >
                <TodayIcon sx={{ fontSize: 50, marginRight: 2 }} />
                ข้อมูลการคืนรถ
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* ปฏิทิน */}
        <Grid item xs={12} md={4}>
          <Card sx={{ maxWidth: 345, marginTop: -22 }}>
            <CardContent>
              <Typography
                variant="h6"
                component="div"
                sx={{ textAlign: "center" }}
              >
                ปฏิทิน
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </ThemeProvider>
    </div>
  );
};

export default UserMain;
