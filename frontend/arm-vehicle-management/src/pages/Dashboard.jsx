import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ApexCharts from 'react-apexcharts';
import dayjs from 'dayjs';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const Dashboard = () => {
  const [missions, setMissions] = useState([]);
  const [data, setData] = useState(null);
  const [fuelData, setFuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setData(response.data);
        } catch (error) {
          setError('Failed to fetch dashboard data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/missions');
        setMissions(response.data);
      } catch (error) {
        setError('Failed to fetch mission data');
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

   // ดึงข้อมูลเชื้อเพลิง
   useEffect(() => {
    const fetchFuelData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fuel');
        const fuelRecords = response.data;
  
        // แยกข้อมูลตามสถานะ (pending, completed)
        const pendingCount = fuelRecords.filter(fuel => fuel.status === 'pending').length;
        const completedCount = fuelRecords.filter(fuel => fuel.status === 'completed').length;
  
        // เซ็ตข้อมูลที่แยกแล้วไปยัง state fuelData
        setFuelData({ pending: pendingCount, completed: completedCount });
      } catch (error) {
        setError('Failed to fetch fuel data');
      }
    };
    fetchFuelData();
  }, []);
  

  const groupMissionsByDay = (missions) => {
    const grouped = {};

    missions.forEach(mission => {
      const day = dayjs(mission.createdAt).format('YYYY-MM-DD');
      const status = mission.status;

      if (!grouped[day]) {
        grouped[day] = { completed: 0, pending: 0, inProgress: 0 };
      }

      if (status === 'completed') grouped[day].completed++;
      if (status === 'pending') grouped[day].pending++;
      if (status === 'in-progress') grouped[day].inProgress++;
    });

    return grouped;
  };

  const groupedMissions = groupMissionsByDay(missions);

  // Pie chart data for vehicle status
  const vehicleStatusData = {
    series: [data?.available, data?.inUse, data?.maintenance],
    options: {
      chart: {
        type: 'pie',
        height: 250,
      },
      labels: ['พร้อมใช้งาน', 'กำลังใช้งาน', 'ซ่อมบำรุง'],
      colors: ['#28a745', '#ffc107', '#dc3545'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  };

  // Pie chart data for mission status
  const missionStatusData = {
    series: [
      Object.values(groupedMissions).reduce((acc, day) => acc + day.completed, 0),
      Object.values(groupedMissions).reduce((acc, day) => acc + day.pending, 0),
      Object.values(groupedMissions).reduce((acc, day) => acc + day.inProgress, 0),
    ],
    options: {
      chart: {
        type: 'pie',
        height: 250,
      },
      labels: ['สำเร็จ', 'รออนุมัติ', 'อยู่ระหว่างภารกิจ'],
      colors: ['#28a745', '#ffc107', '#dc3545'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  };

  const fuelStatusData = {
    series: [fuelData?.completed || 0,fuelData?.pending   || 0], // ใช้ข้อมูลเชื้อเพลิงที่แยกสถานะ 
    options: {
      chart: {
        type: 'pie',
        height: 250,
      },
      labels: [ 'สำเร็จ','รออนุมัติ'],
      colors: ['#28a745','#ffc107'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  };
  

  // Combine data for the line chart
  const lineChartData = {
    series: [
      {
        name: 'Vehicles Available',
        data: Object.keys(groupedMissions).map((day) => data?.available || 0),
      },
      {
        name: 'Missions Completed',
        data: Object.keys(groupedMissions).map((day) => groupedMissions[day]?.completed || 0),
      },
    ],
    options: {
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: Object.keys(groupedMissions),
      },
      colors: ['#28a745', '#ffc107'],
    },
  };

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;
  if (!data) return <div className="text-center py-6">No data available</div>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Grid container spacing={4}>
        {/* Vehicle Status Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" gutterBottom>
                สถานะรถ
              </Typography>
              <ApexCharts
                options={vehicleStatusData.options}
                series={vehicleStatusData.series}
                type="pie"
                height="250"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Mission Status Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" gutterBottom>
                สถานะภารกิจ
              </Typography>
              <ApexCharts
                options={missionStatusData.options}
                series={missionStatusData.series}
                type="pie"
                height="250"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Status Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" gutterBottom>
                สถานะเชื้อเพลิง
              </Typography>
              <ApexCharts
                options={fuelStatusData.options}
                series={fuelStatusData.series}
                type="pie"
                height="250"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart for Combined Data (Vehicles + Missions) */}
        <Grid item xs={12}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" gutterBottom>
                สถิติรวมสถานะรถและภารกิจ (รายวัน)
              </Typography>
              <ApexCharts
                options={lineChartData.options}
                series={lineChartData.series}
                type="line"
                height="350"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
  
};

export default Dashboard;
