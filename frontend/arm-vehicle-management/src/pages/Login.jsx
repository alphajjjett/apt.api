import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // เพิ่ม role state
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        // เปลี่ยน apiUrl ให้แน่ใจว่ามันถูกต้องสำหรับ user login
        const apiUrl = role === 'admin' 
            ? 'http://localhost:5000/api/auth/login' // admin login route
            : 'http://localhost:5000/api/users/login'; // user login route

        const response = await axios.post(apiUrl, { email, password });
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
    } catch (err) {
        setError('Invalid credentials');
    }
};


  return (
    <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
