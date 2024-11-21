const User = require('../models/user.model');  // ใช้ model ของ User
const Mission = require('../models/mission.model');  // ใช้ model ของ Mission

// Controller สำหรับการดึงข้อมูล Dashboard
const getDashboardData = async (req, res) => {
  try {
    // ดึงจำนวนของ users
    const usersCount = await User.countDocuments();
    
    // ดึงจำนวนของ missions
    const missionsCount = await Mission.countDocuments();
    
    // ส่งข้อมูลกลับไปยัง frontend
    res.status(200).json({ usersCount, missionsCount });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

module.exports = { getDashboardData };
