import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';  // Add navigate functionality
import { jwtDecode } from 'jwt-decode';  // ใช้ jwt-decode
import axios from 'axios';  // ใช้ axios สำหรับการทำ HTTP requests

const UserProfilePage = () => {
  const { id } = useParams();  // ใช้ id จาก URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Track edit state
  const [editableName, setEditableName] = useState(""); // Track editable name
  const [editableEmail, setEditableEmail] = useState(""); // Track editable email
  const [editableDescription, setEditableDescription] = useState(""); // Track editable description

  const navigate = useNavigate();  // Initialize navigate

  // ฟังก์ชันสำหรับปุ่ม "Back to Dashboard"
  const handleBackClick = () => {
    navigate('/dashboard');  // นำทางกลับไปที่หน้า Dashboard
  };

  // ฟังก์ชันสำหรับการคลิก "Edit"
  const handleEditClick = () => {
    setIsEditing(true);  // เปลี่ยนเป็นโหมดแก้ไข
    setEditableName(user.name);  // ตั้งค่า name ที่จะแก้ไข
    setEditableEmail(user.email);  // ตั้งค่า email ที่จะแก้ไข
    setEditableDescription(user.description || "");  // ตั้งค่าคำอธิบายที่จะแก้ไข
  };

  // ฟังก์ชันสำหรับบันทึกการแก้ไข
  const handleSaveClick = async () => {
    const updatedUser = {
      name: editableName,
      email: editableEmail,
      description: editableDescription, // ใช้ description ที่แก้ไข
    };

    try {
      // ส่งข้อมูลที่แก้ไขไปยัง backend (PUT request)
      const response = await axios.put(`http://localhost:5000/api/users/${id}`, updatedUser, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,  // ใช้ token สำหรับการตรวจสอบ
        }
      });

      console.log("User data updated on server:", response.data);  // ตรวจสอบข้อมูลที่ส่งกลับจากเซิร์ฟเวอร์

      // อัปเดตข้อมูลใน state
      setUser(response.data); 
      setIsEditing(false);  // ปิดโหมดแก้ไข

      // เรียกฟังก์ชันเพื่อดึงข้อมูลใหม่จาก server
      fetchUserData(); 
    } catch (error) {
      setError('Error updating user data');
    }
  };

  // ฟังก์ชันเพื่อดึงข้อมูลผู้ใช้
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(response.data); // อัปเดตข้อมูลผู้ใช้ใน state
    } catch (error) {
      console.error('Error fetching user data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

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

        // ตรวจสอบว่า token ยังไม่หมดอายุ
        if (decodedToken.exp < Date.now() / 1000) {
          setError('Token has expired, please login again');
          setLoading(false);
          return;
        }

        // ตรวจสอบว่า id จาก URL ตรงกับ id ใน token หรือไม่
        if (decodedToken.id !== id) {
          setError('User not authorized to view this profile');
          setLoading(false);
          return;
        }

        // ถ้า id ตรงกัน แสดงข้อมูลจาก decodedToken
        if (isMounted) {
          setUser({
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
            description: decodedToken.description || "",  // ใช้ description จาก token
          });
        }
      } catch (error) {
        setError('Error decoding token or fetching user data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false; // Cleanup on component unmount
    };
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>User Profile</h2>
      {user && (
        <div>
          <p><strong>Name:</strong> 
            {isEditing ? 
              <input
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
              /> 
              : 
              user.name
            }
          </p>
          <p><strong>Email:</strong> 
            {isEditing ? 
              <input
                type="email"
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
              /> 
              : 
              user.email
            }
          </p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Description:</strong> 
            {isEditing ? 
              <textarea
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
              /> 
              : 
              user.description
            }
          </p>
        </div>
      )}
      {/* ปุ่ม Back to Dashboard */}
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>

      {/* ปุ่ม Edit หรือ Save */}
      {isEditing ? (
        <button onClick={handleSaveClick} style={{ marginTop: '20px' }}>
          Save Changes
        </button>
      ) : (
        <button onClick={handleEditClick} style={{ marginTop: '20px' }}>
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;
