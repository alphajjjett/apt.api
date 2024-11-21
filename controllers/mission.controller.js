const Mission = require('../models/mission.model');
const Vehicle = require('../models/vehicle.model'); // สมมติว่าคุณมี Vehicle model
const User = require('../models/user.model'); // สมมติว่าคุณมี User model

// เพิ่มภารกิจใหม่
const createMission = async (req, res) => {
    const { mission_name, description, status, assigned_vehicle_id, assigned_user_id } = req.body;

    try {
        // ตรวจสอบว่า vehicle และ user ที่ถูกอ้างอิงนั้นมีอยู่ในระบบจริง
        const vehicle = await Vehicle.findById(assigned_vehicle_id);
        const user = await User.findById(assigned_user_id);
        
        if (!vehicle || !user) {
            return res.status(400).json({ message: 'Vehicle or User not found' });
        }

        // สร้างภารกิจใหม่
        const newMission = new Mission({
            mission_name,
            description,
            status: status || 'pending',
            assigned_vehicle_id,
            assigned_user_id
        });

        // บันทึกข้อมูลภารกิจ
        await newMission.save();

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

module.exports = { createMission, getAllMissions };
