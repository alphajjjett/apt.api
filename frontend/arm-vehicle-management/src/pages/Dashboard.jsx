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
      navigate('/', { replace: true });  // Redirect to login if no token
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setData(response.data);  // Store the fetched data
        } catch (error) {
          setError('Failed to fetch dashboard data');  // Show error message
        } finally {
          setLoading(false);  // Stop loading
        }
      };
      fetchData();
    }
  }, [navigate]);

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;
  if (!data) return <div className="text-center py-6">No data available</div>;


  const chartData = {
    labels: ['Missions', 'Bookings', 'Vehicles'], 
    datasets: [
      {
        label: 'Total Count',  
        data: [data.missionsCount, data.bookingCount, data.vehicleCount],  
        backgroundColor: 'rgba(75, 192, 192, 0.2)',  
        borderColor: 'rgba(75, 192, 192, 1)',  
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
    <div className="min-h-screen bg-blue-200 p-6 flex flex-col justify-center items-center">
      {/* Flex container for Dashboard and Calendar */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 w-full max-w-6xl">
        {/* Dashboard Card */}
        <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl w-full">
          <h2 className="text-3xl font-bold text-center mb-6">Graph</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <h3 className="text-xl font-semibold">Total Missions: <span className="text-gray-600">{data.missionsCount}</span></h3>
            <h3 className="text-xl font-semibold">Total Bookings: <span className="text-gray-600">{data.bookingCount}</span></h3>
            <h3 className="text-xl font-semibold">Total Vehicles: <span className="text-gray-600">{data.vehicleCount}</span></h3>
          </div>


          {/* Graph Section */}
          <div className="mb-6">
            <Bar data={chartData} options={options} />
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full lg:max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Calendar</h2>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar/>
          </LocalizationProvider>
        </div>
      </div>

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
  );
};

export default Dashboard;
