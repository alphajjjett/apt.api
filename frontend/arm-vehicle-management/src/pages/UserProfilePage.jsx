import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';  // Add navigate functionality
import { jwtDecode } from 'jwt-decode';  // ใช้ jwt-decode

const UserProfilePage = () => {
  const { id } = useParams();  // ใช้ id จาก URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  // สถานะการแก้ไข
  const [updatedUser, setUpdatedUser] = useState({});  // เก็บข้อมูลที่ถูกแก้ไข

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
        setUpdatedUser({
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

  const handleEditClick = () => {
    setIsEditing(true);  // เปิดโหมดแก้ไข
  };

  const handleChange = (e) => {
    setUpdatedUser({
      ...updatedUser,
      [e.target.name]: e.target.value,  // อัพเดตข้อมูลที่ถูกแก้ไข
    });
  };

  const handleSaveClick = () => {
    setUser(updatedUser);  // บันทึกข้อมูลที่ถูกแก้ไข
    setIsEditing(false);  // ปิดโหมดแก้ไข
  };

  const handleCancelClick = () => {
    setIsEditing(false);  // ปิดโหมดแก้ไข
    setUpdatedUser(user);  // รีเซ็ตข้อมูลกลับไปยังข้อมูลเดิม
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>User Profile</h2>
      {user && (
        <div>
          <p><strong>Name:</strong> {isEditing ? (
            <input 
              type="text" 
              name="name" 
              value={updatedUser.name} 
              onChange={handleChange} 
            />
          ) : (
            user.name
          )}</p>
          <p><strong>Email:</strong> {isEditing ? (
            <input 
              type="email" 
              name="email" 
              value={updatedUser.email} 
              onChange={handleChange} 
            />
          ) : (
            user.email
          )}</p>
          <p><strong>Role:</strong> : {user.role}</p>
        </div>
      )}
      {!isEditing ? (
        <button onClick={handleEditClick} style={{ marginTop: '20px' }}>
          Edit
        </button>
      ) : (
        <>
          <button onClick={handleSaveClick} style={{ marginTop: '20px' }}>
            Save
          </button>
          <button onClick={handleCancelClick} style={{ marginTop: '20px', marginLeft: '10px' }}>
            Cancel
          </button>
        </>
      )}
      {/* ปุ่ม Back to Dashboard */}
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default UserProfilePage;
