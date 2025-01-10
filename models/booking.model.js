const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',  
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',  
    required: true,
  },
  bookingDate: {
    type: Date,
    require : true
  },
  status: {
      type: String,
      enum: ['maintenance','dispose'],
      default: ''
  },
  description : {
      type  : String
  }
  
},
{
    timestamps : true
});

module.exports = mongoose.model('Booking', BookingSchema);
