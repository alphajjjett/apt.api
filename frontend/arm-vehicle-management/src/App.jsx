import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import Users from './pages/Users';
import Missions from './pages/Missions';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import MissionList from './pages/MissionList';
import ProtectedRoute from './pages/ProtectedRoute';
import MissionRequest from './pages/MissionRequest';
import VehiclePage from './pages/VehiclePage';
import UserProfilePage from './pages/UserProfilePage';
import VehicleStatusPage from './pages/VehicleStatusPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* เพิ่ม route สำหรับ Register */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path='/missionslist' element={<MissionList/>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/mission_request' element={<MissionRequest/>}/>
        <Route path='/vehicle' element={<VehiclePage/>}/>
        <Route path="/userprofile/:id" element={<UserProfilePage />} /> 
        
        <Route path="/vehicle-status" element={<VehicleStatusPage/>}/>
        

      </Routes>
    </Router>
  );
}

export default App;
