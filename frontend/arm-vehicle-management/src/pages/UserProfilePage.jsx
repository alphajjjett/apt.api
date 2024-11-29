import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserProfilePage = () => {
  const { id } = useParams();  // ดึง id จาก URL
  console.log(id);  // ตรวจสอบว่า id ดึงมาได้ถูกต้องหรือไม่
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');  // ดึง token จาก localStorage
      if (!token) {
        setError('No token found, please login again');
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }  // ส่ง token ไปใน header
        });
        setUser(response.data);  // เก็บข้อมูล user ที่ได้จาก API
      } catch (error) {
        setError('Error fetching user data');  // แสดง error ถ้าดึงข้อมูลไม่สำเร็จ
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [id]);
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>User Profile</h2>
      {user && (
        <div>
          <p><strong>Name:</strong> {user.name}</p>  {/* แสดงข้อมูล Name ของผู้ใช้ */}
          <p><strong>Email:</strong> {user.email}</p>  {/* แสดงข้อมูล Email ของผู้ใช้ */}
          <p><strong>Role:</strong> {user.role}</p>  {/* แสดงข้อมูล Role ของผู้ใช้ */}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
