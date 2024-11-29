import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');  // กดปุ่มกลับไปที่ dashboard
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });  // ถ้าไม่มี token ให้กลับไปที่หน้า login
    } else {
      try {
        const decodedToken = jwtDecode(token);  // decode token เพื่อดึง role
        console.log(decodedToken);  // log decodedToken เพื่อตรวจสอบ

        // ตรวจสอบ role
        if (decodedToken.role === 'user') {
          // ถ้า role เป็น user ให้ redirect ไปหน้า user profile ของตัวเอง
          navigate(`/userprofile/${decodedToken.userId}`, { replace: true });  // ให้ redirect ไปที่หน้า user profile
        } else if (decodedToken.role === 'admin') {
          // ถ้า role เป็น admin ให้ fetch ข้อมูลผู้ใช้
          const fetchUsers = async () => {
            try {
              const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('Users fetched:', response);  // log response เพื่อตรวจสอบข้อมูล
              setUsers(response.data);
            } catch (error) {
              console.error('Error fetching users:', error);  // log error ที่เกิดขึ้นจากการดึงข้อมูล
              setError('Failed to fetch users');
            } finally {
              setLoading(false);
            }
          };
          fetchUsers();
        } else {
          // ถ้า role ไม่ใช่ user หรือ admin ให้ redirect กลับหน้า login
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/', { replace: true });  // ถ้า token ไม่ถูกต้องให้ redirect ไปหน้า login
      }
    }
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(users.filter(user => user._id !== userId));  // ลบผู้ใช้จาก state
      } catch (error) {
        console.error('Error deleting user:', error);  // log error ที่เกิดขึ้นตอนลบ
        setError('Failed to delete user');
      }
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;
  if (users.length === 0) return <p>No users found</p>;

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => navigate(`/users/${user._id}`)}>View Profile</button>
                <button onClick={() => navigate(`/users/edit/${user._id}`)} style={{ marginLeft: '10px' }}>Edit</button>
                <button onClick={() => handleDeleteUser(user._id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>Back to Dashboard</button>
    </div>
  );
};

export default Users;
