import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';  // Add navigate functionality
// import axios from 'axios';
import {jwtDecode} from 'jwt-decode';  // ใช้ jwt-decode

const UserProfilePage = () => {
  const { id } = useParams();  // ใช้ id จาก URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();  // Initialize navigate
   // ฟังก์ชันสำหรับปุ่ม "Back to Dashboard"
   const handleBackClick = () => {
    navigate('/dashboard');  // นำทางกลับไปที่หน้า Dashboard
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');  // ดึง token จาก localStorage

      if (!token) {
        setError('No token found, please login again');
        setLoading(false);
        return;
      }

      try {
        // ใช้ jwtDecode เพื่อถอดรหัส token และดึงข้อมูลผู้ใช้
        const decodedToken = jwtDecode(token);  
        console.log(decodedToken); // log เพื่อดูข้อมูลใน token

        // ตรวจสอบว่า id จาก URL ตรงกับ id ใน token หรือไม่
        if (decodedToken.id !== id) {
          setError('User not authorized to view this profile');
          setLoading(false);
          return;
        }

        // ถ้า id ตรงกัน แสดงข้อมูลจาก decodedToken
        setUser({
          name: decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role,
        });
      } catch (error) {
        setError('Error decoding token or fetching user data');
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
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>  
      )}
      {/* ปุ่ม Back to Dashboard */}
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default UserProfilePage;
