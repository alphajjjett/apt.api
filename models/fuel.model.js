const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fuelCapacity: { 
    type: Number, 
    required: true 
  },
  fuelDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed','cancel'], // กำหนดค่า enum สำหรับ status
    default: 'pending' // กำหนดค่าเริ่มต้นเป็น pending
  }
});

module.exports = mongoose.model('Fuel', fuelSchema);
