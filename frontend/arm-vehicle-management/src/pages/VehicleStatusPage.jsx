import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Add navigate functionality
import {jwtDecode} from 'jwt-decode'; // นำเข้า jwt-decode เพื่อถอดรหัส JWT

const VehicleStatusPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();  // Initialize navigate
   // ฟังก์ชันสำหรับปุ่ม "Back to Dashboard"
   const handleBackClick = () => {
    navigate('/dashboard');  // นำทางกลับไปที่หน้า Dashboard
  };
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    // ถอดรหัส JWT เพื่อตรวจสอบว่าเป็น Admin หรือไม่
    try {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'admin');
    } catch (err) {
      setError('Failed to decode token');
    }

    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(response.data);
      } catch (error) {
        setError('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // ฟังก์ชันอัปเดตสถานะของรถ
  const handleStatusChange = async (vehicleId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      // ส่งคำขอ PUT เพื่ออัปเดตสถานะของรถ
      await axios.put(
        `http://localhost:5000/api/vehicles/${vehicleId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // อัปเดตสถานะใน local state
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle._id === vehicleId ? { ...vehicle, status: newStatus } : vehicle
        )
      );
    } catch (error) {
      setError('Failed to update vehicle status');
    }
  };
  
  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Vehicle Status</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle Name</th>
            <th>Model</th>
            <th>License Plate</th>
            <th>Status</th>
            <th>Last Updated</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle._id}>
              <td>{vehicle.name}</td>
              <td>{vehicle.model}</td>
              <td>{vehicle.license_plate}</td>
              <td>{vehicle.status}</td>
              <td>{new Date(vehicle.updatedAt).toLocaleDateString()}</td> {/* Display Last Updated date */}
              {isAdmin && (
                <td>
                  {/* เพิ่มปุ่มให้ Admin เปลี่ยนสถานะของรถ */}
                  <select
                    value={vehicle.status}
                    onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="in-use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* ปุ่ม Back to Dashboard */}
      <button onClick={handleBackClick} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default VehicleStatusPage;
