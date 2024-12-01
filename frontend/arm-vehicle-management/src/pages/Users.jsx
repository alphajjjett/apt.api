import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';  // Admin role still uses jwtDecode

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');  // Back to dashboard button
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });  // If no token, redirect to login
    } else {
      try {
        const decodedToken = jwtDecode(token);  // Only used for admin role
        console.log(decodedToken);  // Log decoded token to check

        // Check role
        if (decodedToken.role === 'user') {
          // For user, directly fetch their profile without using jwtDecode
          navigate(`/userprofile/${decodedToken.id}`, { replace: true });
        } else if (decodedToken.role === 'admin') {
          // Admin role fetches all users
          const fetchUsers = async () => {
            try {
              const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('Users fetched:', response);
              setUsers(response.data);
            } catch (error) {
              console.error('Error fetching users:', error);
              setError('Failed to fetch users');
            } finally {
              setLoading(false);
            }
          };
          fetchUsers();
        } else {
          // If the role is not user or admin, redirect to login
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/', { replace: true });  // If token is invalid, redirect to login
      }
    }
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(users.filter(user => user._id !== userId));  // Remove user from state
      } catch (error) {
        console.error('Error deleting user:', error);
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
