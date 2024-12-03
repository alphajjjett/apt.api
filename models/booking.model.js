const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',  // Reference to the Mission model
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',  // Reference to the Vehicle model
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
    require : true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
