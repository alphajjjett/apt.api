// const User = require('../models/user.model');  // ใช้ model ของ User
// const Mission = require('../models/mission.model');  // ใช้ model ของ Mission
// const Booking = require('../models/booking.model');
// const Vehicle = require('../models/vehicle.model');

// // Controller สำหรับการดึงข้อมูล Dashboard
// const getDashboardData = async (req, res) => {
//   try {
//     // ดึงจำนวนของ users
//     const usersCount = await User.countDocuments();
    
//     // ดึงจำนวนของ missions
//     const missionsCount = await Mission.countDocuments();

//     const bookingCount = await Booking.countDocuments();
//     const vehicleCount = await Vehicle.countDocuments();
    
//     // ส่งข้อมูลกลับไปยัง frontend
//     res.status(200).json({ usersCount, missionsCount,bookingCount,vehicleCount });
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error);
//     res.status(500).json({ message: 'Error fetching dashboard data' });
//   }
// };


// module.exports = { getDashboardData};

const Vehicle = require('../models/vehicle.model');  

const getVehicleStatusStats = async (req, res) => {
  try {
    const availableCount = await Vehicle.countDocuments({ status: 'available' });
    const inUseCount = await Vehicle.countDocuments({ status: 'in-use' });
    const maintenanceCount = await Vehicle.countDocuments({ status: 'maintenance' });
    res.status(200).json({
      available: availableCount,
      inUse: inUseCount,
      maintenance: maintenanceCount,
    });
  } catch (error) {
    console.error('Error fetching vehicle status data:', error);
    res.status(500).json({ message: 'Error fetching vehicle status data' });
  }
};

module.exports = { getVehicleStatusStats };

