import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
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

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;
  if (!data) return <div className="text-center py-6">No data available</div>;

  const chartData = {
    labels: ['Available', 'In-use', 'Maintenance'],
    datasets: [
      {
        label: 'Vehicle Status Count',
        data: [
          data.available,
          data.inUse,
          data.maintenance
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
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
  };

  return (
    <div className="bg-white p-6 flex flex-col justify-center items-center">
     {/* Stats Section (Cards) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
          <div className="bg-[rgba(75,192,192,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">Total Available</h3>
            <p className="text-gray-600 text-2xl">{data.available}</p>
          </div>

          <div className="bg-[rgba(255,159,64,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">Total In-Use</h3>
            <p className="text-gray-600 text-2xl">{data.inUse}</p>
          </div>

          <div className="bg-[rgba(255,99,132,0.2)] p-6 rounded-lg shadow-md w-full sm:w-1/2 lg:w-1/3 max-w-md">
            <h3 className="text-xl font-semibold">Total Maintenance</h3>
            <p className="text-gray-600 text-2xl">{data.maintenance}</p>
          </div>
        </div>

    <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-6xl">
      {/* Dashboard Card (Graph Section) */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full lg:w-2/3 max-w-4xl mb-6">
        <h2 className="text-3xl font-bold text-center mb-6">Graph</h2>
        <div className="mb-6">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full lg:max-w-md mb-6">
        <h2 className="text-2xl font-bold text-center mb-6">Calendar</h2>
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

  );
};

export default Dashboard;
