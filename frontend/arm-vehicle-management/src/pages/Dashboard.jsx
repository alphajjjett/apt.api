import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;  // แสดงข้อความผิดพลาดหากมีข้อผิดพลาด
  if (!data) return <div>No data available</div>;  // กรณีไม่พบข้อมูล

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <h3>Total Users: {data.usersCount}</h3>
        <h3>Total Missions: {data.missionsCount}</h3>
        <h3>Total Bookings: {data.bookingCount}</h3>
        <h3>Total Vehicles: {data.vehicleCount}</h3>
      </div>

      {/* เพิ่มลิ้งค์ไปยังหน้าอื่น ๆ */}
      <div>
        <Link to="/users">Go to Users Page</Link>
        <br />
        <Link to="/missions">Go to Missions Page</Link>
        <br />
        <Link to="/missionslist">Go to Missions List</Link>
        <br />
        <Link to="/vehicle">Go to Vehicle list</Link>
        <br/>
        <Link to="/vehicle-status">Go to Vehicle Status</Link>
        <br/>
        <Link to="/booking">Go to Booking</Link>
        <br/>
        <Link to="/booking-status">Go to Booking Status</Link>
        <br/>
        <Link to="/return">Go to Return</Link>
      </div>

      {/* เพิ่มปุ่ม logout */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
