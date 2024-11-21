import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  // นำเข้า Link

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
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
  }, []);

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
      </div>
    </div>
  );
};

export default Dashboard;
