import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    name: '',
    license_plate: '',
    model: '',
    fuel_type: '',
    // fuel_capacity: '',
    // description: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(response.data);
    };
    fetchVehicles();

    const token = localStorage.getItem('token');
    if (token) {
      const { role } = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(role === 'admin');
    }
  }, [vehicles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({ ...vehicleData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('http://localhost:5000/api/vehicles/create', vehicleData, config);
      MySwal.fire({
        icon: 'success',
        title: 'Vehicle created successfully',
        text: 'Your vehicle has been created successfully.',
        confirmButtonText: 'OK'
      });
      // alert('Vehicle created successfully');
    } catch (error) {
      alert('Error creating vehicle');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Create New Vehicle Form */}
      {isAdmin && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">สร้างข้อมูลรถ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ยี่ห้อรถ:</label>
              <input
                type="text"
                name="name"
                value={vehicleData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ทะเบียนรถ:</label>
              <input
                type="text"
                name="license_plate"
                value={vehicleData.license_plate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">รุ่น:</label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ประเภทเชื้อเพลง:</label>
              <input
                type="text"
                name="fuel_type"
                value={vehicleData.fuel_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-700"
            >
              สร้างข้อมูลรถ
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;