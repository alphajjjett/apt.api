import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
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
    description: ''
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

  // const handleDelete = async (vehicleId) => {
  //   MySwal.fire({
  //     title: "Are you sure?",
  //     text: "You won't be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, delete it!",
  //     cancelButtonText: "No, cancel!",
  //     reverseButtons: true
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         const token = localStorage.getItem('token');
  //         const config = { headers: { Authorization: `Bearer ${token}` } };
  
  //         await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}`, config);
  //         setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));
          
  //         MySwal.fire({
  //           title: "Deleted!",
  //           text: "The vehicle has been deleted.",
  //           icon: "success"
  //         });
  //       } catch (error) {
  //         MySwal.fire({
  //           title: "Error",
  //           text: "There was an error deleting the vehicle.",
  //           icon: "error"
  //         });
  //       }
  //     } else if (result.dismiss === Swal.DismissReason.cancel) {
  //       MySwal.fire({
  //         title: "Cancelled",
  //         text: "Your vehicle is safe :)",
  //         icon: "error"
  //       });
  //     }
  //   });
  // };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
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
            {/* <div>
              <label className="block text-sm font-medium mb-2">จำนวนน้ำมัน (ลิตร):</label>
              <input
                type="number"
                name="fuel_capacity"
                value={vehicleData.fuel_capacity}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium mb-2">รายละเอียดการซ่อมบำรุง:</label>
              <input
                type="text"
                name="description"
                value={vehicleData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                
              />
            </div> */}
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