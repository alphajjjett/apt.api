const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  description : {
      type  : String,
      required : true,
  },
  },
  {
    timestamps : true
  }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
