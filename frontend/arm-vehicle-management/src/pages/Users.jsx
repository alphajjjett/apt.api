import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Admin role still uses jwtDecode
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);  // Track which user is being edited
  const [updatedUser, setUpdatedUser] = useState({});  // Store the updated user data
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
          navigate(`/profile/${decodedToken.id}`, { replace: true });
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setUsers(users.map((user) => (user._id === userId ? { ...user, ...updatedUser } : user)));
      setEditingUserId(null);
      MySwal.fire({
        title: "Updated!",
        text: "User details have been updated.",
        icon: "success"
      });
    } catch (error) {
      setError('Failed to update user');
      MySwal.fire({
        title: "Error",
        text: "There was an error updating the user.",
        icon: "error"
      });
    }
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
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Description</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={updatedUser.name || user.name}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded"
                    />
                  </>
                ) : (
                  user.name
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={updatedUser.email || user.email}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded"
                    />
                  </>
                ) : (
                  user.email
                )}
              </td>
              <td className="py-2 px-4">
                  {user.role} 
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <>
                    <input
                      type="text"
                      name="description"
                      value={updatedUser.description || user.description}
                      onChange={handleEditChange}
                      className="border px-2 py-1 rounded"
                    />
                  </>
                ) : (
                  user.description
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(user._id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded ml-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingUserId(null); // Cancel editing
                        setUpdatedUser({}); // Reset updated user data
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded ml-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingUserId(user._id)}
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
                  </>
                )}
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
