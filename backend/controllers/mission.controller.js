const Mission = require('../models/mission.model');
const Vehicle = require('../models/vehicle.model'); // สมมติว่าคุณมี Vehicle model
const User = require('../models/user.model'); // สมมติว่าคุณมี User model
const { notifyLine } = require('../notify/notify');

const tokenLine = process.env.LINE_TOKEN;

// เพิ่มภารกิจใหม่
const createMission = async (req, res) => {
  const { mission_name,
    description,
    status,
    quantity,
    assigned_user_id,
    assigned_vehicle_id,
    start_date, end_date } = req.body;

  try {
    // ตรวจสอบว่า vehicle และ user ที่ถูกอ้างอิงนั้นมีอยู่ในระบบจริง
    const vehicle = await Vehicle.findById(assigned_vehicle_id);
    const user = await User.findById(assigned_user_id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!vehicle) {
      return res.status(400).json({ message: 'Vehicle not found' });
    }

    // ตรวจสอบว่า start_date และ end_date มีค่าหรือไม่
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and End date are required' });
    }

    // แปลง start_date และ end_date เป็น Date object
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // ตรวจสอบว่า start_date และ end_date เป็น valid Date หรือไม่
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // ตรวจสอบว่า start_date ไม่เกิน end_date
    if (startDate > endDate) {
      return res.status(400).json({ message: 'Start date must be earlier than end date' });
    }

    // ตรวจสอบว่า vehicle ถูกจองในช่วงเวลาเดียวกันหรือไม่
    const overlappingMission = await Mission.findOne({
      assigned_vehicle_id,
      $or: [
        { start_date: { $lt: endDate }, end_date: { $gt: startDate } },
        { start_date: { $lte: endDate }, end_date: { $gte: startDate } }
      ]
    });

    if (overlappingMission) {
      return res.status(400).json({ message: 'The vehicle is already assigned to another mission during the specified dates' });
    }

    // สร้างภารกิจใหม่
    const newMission = new Mission({
      mission_name,
      description,
      status: status || 'waiting', // กำหนดค่า default สำหรับ status
      assigned_user_id,
      assigned_vehicle_id,
      quantity,
      start_date: startDate,
      end_date: endDate,
    });

    // บันทึกข้อมูลภารกิจ
    await newMission.save();

//     // ส่งการแจ้งเตือนไปที่ Line
//     const lineMessage = `
//   ภารกิจ: ${mission_name}
//   รายละเอียดภารกิจ: \n ${description}
//   ผู้จอง: \n ${user.name}
//   จำนวน: ${quantity} คน
//   รถ: ${vehicle.name}
//   ทะเบียน: ${vehicle.license_plate}
//   วันที่จอง: ${startDate.toLocaleDateString()}
//   วันที่คืน: ${endDate.toLocaleDateString()}
//   สถานะ: ${status}
// `;

//     await notifyLine(tokenLine, lineMessage);

    res.status(201).json(newMission);
  } catch (error) {
    res.status(500).json({ message: 'Error creating mission', error });
  }
};


// ดึงข้อมูลภารกิจทั้งหมด พร้อมข้อมูลยานพาหนะและผู้ใช้ที่ถูกมอบหมาย
const getAllMissions = async (req, res) => {
  try {
    const missions = await Mission.find()
      .populate('assigned_vehicle_id') // ดึงข้อมูลยานพาหนะที่เชื่อมโยง
      .populate('assigned_user_id'); // ดึงข้อมูลผู้ใช้ที่เชื่อมโยง

    res.status(200).json(missions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching missions', error });
  }
};


// Update mission status controller
const updateMissionStatus = async (req, res) => {
  const { missionId } = req.params;
  const { status } = req.body;

  try {
    // Find the mission by ID
    const mission = await Mission.findById(missionId);

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Update the mission's status
    mission.status = status;
    await mission.save();

    // If the mission is completed or in-progress, update the status of the assigned vehicle
    if ((status === 'completed' || status === 'in-progress') && mission.assigned_vehicle_id) {
      const vehicle = await Vehicle.findById(mission.assigned_vehicle_id);
      if (vehicle) {
        vehicle.status = 'in-use'; // or any other status you prefer
        await vehicle.save();
      }
    }

    if (status === 'in-progress') {
      const user = await User.findById(mission.assigned_user_id);
      const vehicle = await Vehicle.findById(mission.assigned_vehicle_id);

    const lineMessage = `
  ภารกิจ: ${mission.mission_name}
  รายละเอียดภารกิจ: \n ${mission.description}
  จำนวน: ${mission.quantity} คน
  ผู้จอง: \n ${user ? user.name : 'N/A'}
  รถ: ${vehicle ? vehicle.name : 'N/A'}
  ทะเบียน: ${vehicle ? vehicle.license_plate : 'N/A'}
  วันที่จอง: ${mission.start_date.toLocaleDateString()}
  วันที่คืน: ${mission.end_date.toLocaleDateString()}
  `;
      await notifyLine(tokenLine, lineMessage);
    }

    res.json({ message: 'Mission status updated successfully', mission });
  } catch (error) {
    res.status(500).json({ message: 'Error updating mission status', error });
  }
};



// Update mission controller
const updateMission = async (req, res) => {
  const { missionId } = req.params;
  const { mission_name, description, assigned_vehicle_id, quantity } = req.body;

  try {
    const mission = await Mission.findByIdAndUpdate(
      missionId,
      { mission_name, description, assigned_vehicle_id, quantity },
      { new: true }
    );

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    res.json({ message: 'Mission updated successfully', mission });
  } catch (error) {
    res.status(500).json({ message: 'Error updating mission' });
  }
};



// ฟังก์ชันลบภารกิจ
const deleteMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const deletedMission = await Mission.findByIdAndDelete(missionId);

    if (!deletedMission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    res.status(200).json({ message: 'Mission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mission', error: error.message });
  }
};






module.exports = { createMission, getAllMissions, updateMissionStatus, deleteMission, updateMission };
