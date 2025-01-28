const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  mission: { type: mongoose.Schema.Types.ObjectId, 
            ref: 'Mission', 
            required: true },
  user: { type: mongoose.Schema.Types.ObjectId, 
          ref: 'User', 
          required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, 
          ref: 'Vehicle', 
          required: true },
  bookingDate: { type: Date, 
          required: true },
  returnDate: { type: Date, 
              default: Date.now },
  returnStatus: { type: String, 
              enum: ['pending', 'completed'], 
              default: 'pending' },
  description: { type: String },
}, { timestamps: true }); 

module.exports = mongoose.model('Return', returnSchema);
