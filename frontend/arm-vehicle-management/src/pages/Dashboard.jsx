import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [missions, setMissions] = useState([]);
  const [data, setData] = useState(null);
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

  // ฟังก์ชันในการจัดกลุ่มข้อมูล missions ตามเดือนและสถานะ
  const groupMissionsByMonth = (missions) => {
    const grouped = {};

    missions.forEach(mission => {
      const month = dayjs(mission.createdAt).format('YYYY-MM'); // กรองตามปี-เดือน (เช่น 2025-01)
      const status = mission.status;

      if (!grouped[month]) {
        grouped[month] = { completed: 0, pending: 0, inProgress: 0 };
      }

      if (status === 'completed') grouped[month].completed++;
      if (status === 'pending') grouped[month].pending++;
      if (status === 'in-progress') grouped[month].inProgress++;
    });

    return grouped;
  };

  // จัดกลุ่มข้อมูล missions
  const groupedMissions = groupMissionsByMonth(missions);
  

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;
  if (!data) return <div className="text-center py-6">No data available</div>;



  const chartLabels = Object.keys(groupedMissions); // เดือนต่างๆ
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'ภารกิจสำเร็จ',
        data: chartLabels.map(month => groupedMissions[month].completed),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'อยู่ในระหว่างการยืนยัน',
        data: chartLabels.map(month => groupedMissions[month].pending),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
      {
        label: 'อยู่ในระหว่างการทำภารกิจ',
        data: chartLabels.map(month => groupedMissions[month].inProgress),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        ticks: {
          beginAtZero: true, // เริ่มต้นจากศูนย์
          stepSize: 2,       // ตั้งค่าขั้นตอนให้ห่างกัน 2 ตัวเลข
        },
      },
    },
  };
  
  


  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg"> {/* กูจะเปลี่ยนสีไอ้*** */}
    <div className="bg-white p-6 flex flex-col justify-center items-center">
     {/* Stats Section (Cards) */}
        <div className="flex flex-col lg:flex-row gap-3 mb-5 w-full max-w-6xl">
          <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">พร้อมใช้งาน ( Available )</h3>
            <p className="text-gray-600 text-2xl">จำนวน {data.available} คัน</p>
          </div>

          <div className="bg-[rgba(255,159,64,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">กำลังใช้งาน ( In-Use )</h3>
            <p className="text-gray-600 text-2xl">จำนวน {data.inUse} คัน</p>
          </div>

          <div className="bg-[rgba(255,99,132,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">ซ่อมบำรุง ( Maintenance )</h3>
            <p className="text-gray-600 text-2xl">จำนวน {data.maintenance} คัน</p>
          </div>
        </div>

    <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
      {/* Dashboard Card (Graph Section) */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full lg:w-2/3 max-w-4xl mb-6">
        <h2 className="text-3xl font-bold text-center mb-6">กราฟภารกิจ</h2>
        <div className="mb-6">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full lg:max-w-md mb-6">
        <h2 className="text-2xl font-bold text-center mb-6">ปฏิทิน</h2>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar />
        </LocalizationProvider>
      </div>
    </div>


      {/* Flex container for Calendar Section and Quick Links */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
        {/* Quick Links Card */}
        <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl w-full mt-6">
          <h3 className="text-lg font-semibold mb-4">Quick Links:</h3>
          <ul className="list-none p-0">
            <li><Link to="/missions" className="text-blue-500 hover:text-blue-700">Go to Missions Page</Link></li>
            <li><Link to="/missionslist" className="text-blue-500 hover:text-blue-700">Go to Missions List</Link></li>
            <li><Link to="/vehicle" className="text-blue-500 hover:text-blue-700">Go to Vehicle List</Link></li>
            <li><Link to="/vehicle-status" className="text-blue-500 hover:text-blue-700">Go to Vehicle Status</Link></li>
            <li><Link to="/booking" className="text-blue-500 hover:text-blue-700">Go to Booking</Link></li>
            <li><Link to="/booking-status" className="text-blue-500 hover:text-blue-700">Go to Booking Status</Link></li>
            <li><Link to="/return" className="text-blue-500 hover:text-blue-700">Go to Return</Link></li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
