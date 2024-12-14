import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';  // import CSS file ของ Dashboard

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });  // ถ้าไม่มี token ให้นำผู้ใช้ไปยังหน้า login
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setData(response.data);  // เก็บข้อมูลจาก API
        } catch (error) {
          setError('Failed to fetch dashboard data');  // แสดงข้อความผิดพลาด
        } finally {
          setLoading(false);  // หยุดการโหลด
        }
      };
      fetchData();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');  // ลบ token ออกจาก localStorage
    navigate('/');  // เปลี่ยนเส้นทางไปยังหน้า login
  };

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;
  if (!data) return <div className="text-center py-6">No data available</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Dashboard</h2>
        <div className="mb-6">
          <h3 className="text-xl font-semibold">Total Users: <span className="text-gray-600">{data.usersCount}</span></h3>
          <h3 className="text-xl font-semibold">Total Missions: <span className="text-gray-600">{data.missionsCount}</span></h3>
          <h3 className="text-xl font-semibold">Total Bookings: <span className="text-gray-600">{data.bookingCount}</span></h3>
          <h3 className="text-xl font-semibold">Total Vehicles: <span className="text-gray-600">{data.vehicleCount}</span></h3>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold">Quick Links:</h3>
          <ul className="list-none p-0">
            <li><Link to="/users" className="text-blue-500 hover:text-blue-700">Go to Users Page</Link></li>
            <li><Link to="/missions" className="text-blue-500 hover:text-blue-700">Go to Missions Page</Link></li>
            <li><Link to="/missionslist" className="text-blue-500 hover:text-blue-700">Go to Missions List</Link></li>
            <li><Link to="/vehicle" className="text-blue-500 hover:text-blue-700">Go to Vehicle List</Link></li>
            <li><Link to="/vehicle-status" className="text-blue-500 hover:text-blue-700">Go to Vehicle Status</Link></li>
            <li><Link to="/booking" className="text-blue-500 hover:text-blue-700">Go to Booking</Link></li>
            <li><Link to="/booking-status" className="text-blue-500 hover:text-blue-700">Go to Booking Status</Link></li>
            <li><Link to="/return" className="text-blue-500 hover:text-blue-700">Go to Return</Link></li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
