import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import Missions from './pages/Missions';
import MissionList from './pages/MissionList';
import VehiclePage from './pages/VehiclePage';
import UserProfilePage from './pages/UserProfilePage';
import AdminProfilePage from './pages/AdminProfilePapge';
import MaintenancePage from './pages/MaintenancePage';
import CreateVehicle from './pages/CreateVehicle';
import FuelPage from './pages/FuelPage';
import ReturnInformation from './pages/ReturnPage';
import UserMain from './pages/UserMain';


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
            <Route path="/create-vehicle" element={<CreateVehicle />} />
            <Route path='/vehicle' element={<VehiclePage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/admins/:id" element={<AdminProfilePage />} />
            <Route path="/return" element={<ReturnInformation />} />
            <Route path="/main" element={<UserMain/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;