import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Admin role still uses jwtDecode
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);  // Add state for admins
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);  // Track which user is being edited
  const [updatedUser, setUpdatedUser] = useState({});  // Store the updated user data
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');  // Back to dashboard button
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === 'admin') {
        navigate(`/admins/${decodedToken.id}`, { replace: true });
      } else {
        MySwal.fire({
          title: "Access Denied",
          text: "You do not have admin access to view this page.",
          icon: "error"
        });
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/', { replace: true });
    }
  };

  const handleCreateAdmin = () => {
    MySwal.fire({
      title: 'เพิ่ม Admin',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Name">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Email">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Password" type="password">' +
        '<input id="swal-input4" class="swal2-input" placeholder="Description">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const email = document.getElementById('swal-input2').value;
        const password = document.getElementById('swal-input3').value;
        const description = document.getElementById('swal-input4').value;
        
        if (!name || !email || !password) {
          MySwal.showValidationMessage('Please enter all required fields');
          return;
        }
  
        return { name, email, password, description };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { name, email, password, description } = result.value;
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            'http://localhost:5000/api/admins/register',
            { name, email, password, description },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          MySwal.fire('Created!', 'New admin has been created.', 'success');
        } catch (error) {
          MySwal.fire('Error', 'Failed to create admin.', 'error');
        }
      }
    });
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
          const fetchUsersAndAdmins = async () => {
            try {
              const responseUsers = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const responseAdmins = await axios.get('http://localhost:5000/api/admins', {
                headers: { Authorization: `Bearer ${token}` }
              });
              setUsers(responseUsers.data);
              setAdmins(responseAdmins.data);  // Set admins data
            } catch (error) {
              setError('Failed to fetch users and admins');
            } finally {
              setLoading(false);
            }
          };
          fetchUsersAndAdmins();
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
  if (users.length === 0 && admins.length === 0) return <p>No users or admins found</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Users and Admins</h2>
      
      {/* Admin Profile Button */}
      <button
        onClick={handleProfileClick}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 mt-4 rounded"
      >
        โปรไฟล์ แอดมิน
      </button>
    
    <button
      onClick={handleCreateAdmin}
      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded ml-3"
    >
      เพิ่ม แอดมิน
    </button>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mt-4">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">ชื่อ-นามสกุล</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Email</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">รหัสผ่าน</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">เบอร์โทรศัพท์</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">บทบาท</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">ตำแหน่ง</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...users, ...admins].map((user) => (
            <tr key={user._id} className="border-t">
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="name"
                    value={updatedUser.name || user.name}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="email"
                    name="email"
                    value={updatedUser.email || user.email}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="password"
                    value={updatedUser.password || user.password}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                    <span>••••••••</span> // show ****** แทน
                )}
              </td>
              <td className="py-2 px-4">
                {user.phone}
              </td>
              <td className="py-2 px-4">
                {user.role}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="description"
                    value={updatedUser.description || user.description}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
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
                      บันทึก
                    </button>
                    <button
                      onClick={() => {
                        setEditingUserId(null); // Cancel editing
                        setUpdatedUser({}); // Reset updated user data
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded ml-2"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <>
                    {user.role !== 'admin' && (
                      <>
                        <button
                          onClick={() => setEditingUserId(user._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded ml-2"
                        >
                          แก้ไขข้อมูล
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded ml-2"
                        >
                          ลบข้อมูล
                        </button>
                      </>
                    )}
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
        กลับยังหน้าหลัก
      </button>
    </div>
  );
};

export default Users;
