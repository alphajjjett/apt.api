const Vehicle = require("../models/vehicle.model.js"); // Import Vehicle model



// Controller สำหรับการดึงข้อมูลรถทั้งหมด
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find(); // ดึงข้อมูลรถทั้งหมด
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Controller สำหรับการสร้างข้อมูลรถใหม่
const createVehicle = async (req, res) => {
    const { name, license_plate, model, fuel_type, fuel_capacity } = req.body;
  
    try {
      const newVehicle = new Vehicle({
        name,
        license_plate,
        model,
        fuel_type,
        fuel_capacity: fuel_capacity || 80 // default to 80 liters if not provided
      });
  
      await newVehicle.save();
      res.status(201).json(newVehicle);
    } catch (error) {
      res.status(500).json({ message: 'Error creating vehicle', error });
    }
  };

// Controller สำหรับการดึงข้อมูลรถตาม ID
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Controller สำหรับการอัปเดตข้อมูลรถ
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, { new: true }); // อัปเดตข้อมูลรถ
        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ฟังก์ชันลบรถ
const deleteVehicle = async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);
      
      if (!deletedVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
  };

  // ฟังก์ชันดึงข้อมูลสถานะของรถทั้งหมด
const getAllVehicleStatuses = async (req, res) => {
  try {
      // ดึงข้อมูลจากฐานข้อมูล และแสดงเฉพาะฟิลด์ที่ต้องการ เช่น model, license_plate, และ status
      const vehicles = await Vehicle.find({}, 'model license_plate status');
      res.status(200).json(vehicles);  // ส่งผลลัพธ์เป็น JSON
  } catch (error) {
      res.status(500).json({ message: 'Error fetching vehicle statuses', error: error.message });
  }
};

// ฟังก์ชันอัพเดทสถานะของรถ
const updateVehicleStatus = async (req, res) => {
try {
  const { status } = req.body;
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,           // ID ของรถที่จะอัปเดต
    { status },              // สถานะใหม่ที่ต้องการอัปเดต
    { new: true }            // คืนค่าข้อมูลที่อัปเดตแล้วกลับมา
  );

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  res.status(200).json({ message: 'Vehicle status updated', vehicleStatus: vehicle });
} catch (error) {
  res.status(500).json({ message: 'Error updating vehicle status', error: error.message });
}
};



module.exports = {
    getAllVehicles,
    createVehicle,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    getAllVehicleStatuses
};
