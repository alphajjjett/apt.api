import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Admin role still uses jwtDecode
import '../styles/Users.css';  // Import external CSS
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
      navigate('/', { replace: true });
    } else {
      try {
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);

        if (decodedToken.role === 'user') {
          navigate(`/userprofile/${decodedToken.id}`, { replace: true });
        } else if (decodedToken.role === 'admin') {
          const fetchUsers = async () => {
            try {
              const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
              });
              setUsers(response.data);
            } catch (error) {
              setError('Failed to fetch users');
            } finally {
              setLoading(false);
            }
          };
          fetchUsers();
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setUsers(users.filter(user => user._id !== userId));
  
          MySwal.fire({
            title: "Deleted!",
            text: "The user has been deleted.",
            icon: "success"
          });
        } catch (error) {
          setError('Failed to delete user');
          MySwal.fire({
            title: "Error",
            text: "There was an error deleting the user.",
            icon: "error"
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancelled",
          text: "The user is safe :)",
          icon: "error"
        });
      }
    });
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;
  if (users.length === 0) return <p>No users found</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Name</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Email</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Role</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => navigate(`/users/${user._id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate(`/users/edit/${user._id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded ml-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleBackClick}
        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 mt-4 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Users;
