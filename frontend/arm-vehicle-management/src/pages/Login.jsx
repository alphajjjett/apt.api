import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; 

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
  
      // Reload the page to reflect the login status
      window.location.reload();
    } catch (err) {
      setError('Invalid credentials'); // Set error message for invalid login
    }
  };

  // Handle navigate to the register page
  const goToRegister = () => {
    navigate('/register'); // Navigate to the registration page
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="role" className="block">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select-role"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="button"
          >
            Login
          </button>
        </form>

        <div className="register-link">
          <p>Don't have an account? <a href="/register" onClick={goToRegister}>Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
