const Fuel = require('../models/fuel.model');

// Get all fuel records
const getFuelRecords = async (req, res) => {
    try {
      const fuelRecords = await Fuel.find();
      res.status(200).json(fuelRecords);
    } catch (error) {
      res.status(400).json({ message: 'Error retrieving fuel records', error });
    }
  };

// Create new fuel record
const createFuelRecord = async (req, res) => {
    try {
      const { userId, vehicleId, fuelCapacity } = req.body;
  
      // สร้าง fuel record ตามโมเดลที่กำหนดไว้
      const fuelRecord = new Fuel({
        userId,         // ObjectId ของผู้ใช้งาน
        vehicleId,      // ObjectId ของรถ
        fuelCapacity,   // จำนวนเชื้อเพลิงที่เบิก
        fuelDate: new Date(),  // กำหนดวันที่ปัจจุบัน
      });
  
      await fuelRecord.save();
      res.status(201).json(fuelRecord);
    } catch (error) {
      res.status(400).json({ message: 'Error creating fuel record', error });
    }
  };
  


  const updateFuelRecord = async (req, res) => {
    const { id } = req.params;
    const { fuelCapacity } = req.body; 
  
    try {
      const updatedFuel = await Fuel.findByIdAndUpdate(id, 
        { fuelCapacity,
          fuelDate: new Date()
         }, 
        { new: true }); 
      res.json(updatedFuel);  
    } catch (error) {
      res.status(500).json({ error: 'Error updating fuel record' });
    }
  };
  

// Delete fuel record by ID
const deleteFuelRecord = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedFuel = await Fuel.findByIdAndDelete(id);
  
      if (!deletedFuel) {
        return res.status(404).json({ message: 'Fuel record not found' });
      }
  
      res.status(200).json({ message: 'Fuel record deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Error deleting fuel record', error });
    }
  };

module.exports = { getFuelRecords,createFuelRecord,deleteFuelRecord,updateFuelRecord};