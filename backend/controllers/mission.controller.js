const Mission = require('../models/mission.model');
const Vehicle = require('../models/vehicle.model'); // สมมติว่าคุณมี Vehicle model
const User = require('../models/user.model'); // สมมติว่าคุณมี User model
const { pushMessage } = require('../notify/notify');

// const tokenLine = process.env.LINE_TOKEN;

const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;
// const lineUserId = process.env.LINE_USER_ID;

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
    // ค้นหาภารกิจจาก ID
    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // อัปเดตสถานะของภารกิจ
    mission.status = status;
    await mission.save();

    // หากสถานะเป็น in-progress ให้ส่ง push message ไปยัง LINE ID ที่กำหนดไว้
    if (status === 'in-progress') {
      const vehicle = await Vehicle.findById(mission.assigned_vehicle_id);
      const user = await User.findById(mission.assigned_user_id);

      const lineMessage = `
ภารกิจ: ${mission.mission_name}
รายละเอียด: ${mission.description}
ผู้จอง: ${user ? user.name : 'ไม่ระบุ'}
จำนวน: ${mission.quantity} คน
รถที่ใช้: ${vehicle ? vehicle.name : 'ไม่ระบุ'}
ทะเบียน: ${vehicle ? vehicle.license_plate : 'ไม่ระบุ'}
วันที่เริ่ม: ${mission.start_date.toLocaleDateString()}
วันที่สิ้นสุด: ${mission.end_date.toLocaleDateString()}
สถานะ: ${mission.status}
      `;

      await pushMessage(channelAccessToken,[{ type: 'text', text: lineMessage.trim() }]);
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
