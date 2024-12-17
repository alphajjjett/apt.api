import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import Missions from './pages/Missions';
import MissionList from './pages/MissionList';
import MissionRequest from './pages/MissionRequest';
import VehiclePage from './pages/VehiclePage';
import UserProfilePage from './pages/UserProfilePage';
import VehicleStatusPage from './pages/VehicleStatusPage';
import BookingPage from './pages/BookingPage';
import BookingStatusPage from './pages/BookingStatusPage';
import VehicleReturnPage from './pages/VehicleReturnPage';

import NavigationBar from './components/Navbar';


import './index.css';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <NavigationBar />
      <div className="d-flex">
        <div className="content flex-grow-1 p-3">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/missions" element={<Missions />} />
            <Route path='/missionslist' element={<MissionList />} />
            <Route path='/mission_request' element={<MissionRequest />} />
            <Route path='/vehicle' element={<VehiclePage />} />
            <Route path="/userprofile/:id" element={<UserProfilePage />} />
            <Route path="/vehicle-status" element={<VehicleStatusPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking-status" element={<BookingStatusPage />} />
            <Route path="/return" element={<VehicleReturnPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
