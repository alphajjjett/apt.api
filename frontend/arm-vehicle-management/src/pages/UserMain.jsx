import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  ThemeProvider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HandymanIcon from "@mui/icons-material/Handyman";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import DescriptionIcon from "@mui/icons-material/Description";
import TodayIcon from "@mui/icons-material/Today";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import theme from "../css/theme";

const UserMain = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken.role === "admin");
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box
        maxWidth="lg"
        mx="auto"
        p={4}
        bgcolor="white"
        borderRadius={3}
        boxShadow={4}
        position="relative"
      >
        <IconButton
          onClick={() => setCalendarOpen(true)}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "linear-gradient(135deg, #607d8b, #455a64)",
            color: "white",
            padding: "12px",
            "&:hover": { transform: "scale(1.1)", boxShadow: 5 },
            transition: "0.3s",
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          🚗 การจองรถ
        </Typography>

        <Grid container spacing={3}>
          {!isAdmin && (
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/missions")}
                sx={{
                  height: "140px",
                  fontSize: "18px",
                  background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                  "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
                  transition: "0.3s",
                  color: "white",
                  fontWeight: "bold",
                  boxShadow: 3,
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 50, marginRight: 2 }} />
                เริ่มการจองรถ
              </Button>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/missionslist")}
              sx={{
                height: "140px",
                fontSize: "18px",
                background: "linear-gradient(135deg, #ff9800, #f57c00)",
                "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
                transition: "0.3s",
                color: "white",
                fontWeight: "bold",
                boxShadow: 3,
              }}
            >
              <EventAvailableIcon sx={{ fontSize: 50, marginRight: 2 }} />
              ข้อมูลการจองรถ
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h4" sx={{ fontWeight: "bold", mt: 4 }}>
          ℹ️ ข้อมูล
        </Typography>
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/vehicle")}
              sx={{
                height: "140px",
                fontSize: "18px",
                background: "linear-gradient(135deg, #2196f3, #1976d2)",
                "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
                transition: "0.3s",
                color: "white",
                fontWeight: "bold",
                boxShadow: 3,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 50, marginRight: 2 }} />
              ข้อมูลรถ
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/maintenance")}
              sx={{
                height: "140px",
                fontSize: "18px",
                background: "linear-gradient(135deg, #f44336, #d32f2f)",
                "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
                transition: "0.3s",
                color: "white",
                fontWeight: "bold",
                boxShadow: 3,
              }}
            >
              <HandymanIcon sx={{ fontSize: 50, marginRight: 2 }} />
              ข้อมูลการซ่อมบำรุง
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/fuel")}
              sx={{
                height: "140px",
                fontSize: "18px",
                background: "linear-gradient(135deg, #ffeb3b, #fbc02d)",
                "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
                transition: "0.3s",
                color: "#000",
                fontWeight: "bold",
                boxShadow: 3,
              }}
            >
              <LocalGasStationIcon sx={{ fontSize: 50, marginRight: 2 }} />
              ข้อมูลการเบิกเชื้อเพลิง
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/return")}
              sx={{
                height: "140px",
                fontSize: "18px",
                background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
                "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
                transition: "0.3s",
                color: "white",
                fontWeight: "bold",
                boxShadow: 3,
              }}
            >
              <TodayIcon sx={{ fontSize: 50, marginRight: 2 }} />
              ข้อมูลการคืนรถ
            </Button>
          </Grid>
        </Grid>
        <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)}>
          <DialogTitle>📅 ปฏิทิน</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
              />
            </LocalizationProvider>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default UserMain;
