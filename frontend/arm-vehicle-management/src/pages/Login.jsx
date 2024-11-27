import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to user role
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle login for both user and admin
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const apiUrl = role === 'admin'
        ? 'http://localhost:5000/api/auth/login' // Admin login route
        : 'http://localhost:5000/api/users/login'; // User login route

      const response = await axios.post(apiUrl, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard'); // Navigate to the dashboard upon successful login
    } catch (err) {
      setError('Invalid credentials'); // Set error message for invalid login
    }
  };

  // Handle navigate to the register page
  const goToRegister = () => {
    navigate('/register'); // Navigate to the registration page
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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

      <div>
        <p>Don't have an account?</p>
        <button onClick={goToRegister}>Register</button> {/* Button to navigate to the register page */}
      </div>
    </div>
  );
};

export default Login;
