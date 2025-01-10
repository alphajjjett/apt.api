const Booking = require('../models/booking.model');
const Mission = require('../models/mission.model');
const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');


// ดึงข้อมูล Booking ทั้งหมด
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('mission user vehicle'); // ดึงข้อมูล Booking ทั้งหมด พร้อมข้อมูลที่อ้างอิง
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// // Update booking status
// const updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;  // Get bookingId from URL parameters
//     const { status } = req.body;  // Get new status from request body

//     // Find the booking by ID and update its status
//     const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     res.status(200).json(booking);  // Return the updated booking
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating booking status' });
//   }
// };


// ดึงข้อมูล Booking ตาม id
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id; // รับ id จาก route parameter
    const booking = await Booking.findById(bookingId).populate('mission user vehicle'); // ดึงข้อมูล Booking ตาม id พร้อมข้อมูลที่อ้างอิง
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    return res.status(200).json(booking);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// Controller for deleting a booking by ID
// booking.controller.js
const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Use findByIdAndDelete instead of booking.remove
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error });
  }
};




module.exports = {
  getAllBookings,
  getBookingById,
  deleteBooking
};
