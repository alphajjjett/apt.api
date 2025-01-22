import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const navigate = useNavigate();

 // Handle login for both user and admin
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const apiUrl = role === 'admin'
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/users/login'; 

    const response = await axios.post(apiUrl, { email, password });
    localStorage.setItem('token', response.data.token);


    Swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      text: `Welcome ${role === 'admin' ? 'Admin' : 'User'}!`,
      confirmButtonColor: '#3085d6',
    }).then(() => {
      if (role === 'admin') {
        navigate('/dashboard'); 
      } else {
        navigate('/main'); 
      }
      window.location.reload(); 
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      confirmButtonColor: '#d33',
      confirmButtonText: 'ลองอีกครั้ง',
    });
  }
};


 
  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container min-h-screen flex items-center justify-center rounded-lg font-noto">
      <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">อีเมล์</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 mb-2">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>ยังไม่มีบัญชี ? <button onClick={goToRegister} className="text-blue-500 hover:underline">สมัครสมาชิก</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
