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
  }
});

module.exports = mongoose.model('Fuel', fuelSchema);
