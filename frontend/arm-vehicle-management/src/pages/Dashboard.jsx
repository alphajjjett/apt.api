import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';  // นำเข้า useNavigate สำหรับ redirect

const Dashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();  // ใช้สำหรับการ navigate เมื่อ logout

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });  // ถ้าไม่มี token ให้นำผู้ใช้ไปยังหน้า login
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/dashboard', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setData(response.data);  // เก็บข้อมูลจาก API
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');  // ลบ token ออกจาก localStorage
    window.location.replace('/');  // เปลี่ยน URL และแทนที่ใน history
    window.location.reload();  // โหลดหน้าใหม่ทั้งหมด
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <h3>Total Users: {data.usersCount}</h3>
        <h3>Total Missions: {data.missionsCount}</h3>
      </div>

      {/* เพิ่มลิ้งค์ไปยังหน้าอื่น ๆ */}
      <div>
        <Link to="/users">Go to Users Page</Link>
        <br />
        <Link to="/missions">Go to Missions Page</Link>
        <br />
        <Link to="/missionslist">Go to Missions List</Link>
        <br />
      </div>

      {/* เพิ่มปุ่ม logout */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
