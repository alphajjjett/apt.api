import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Missions from './pages/Missions';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import MissionList from './pages/MissionList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path='/missionslist' element={<MissionList/>} />
      </Routes>
    </Router>
  );
}

export default App;
