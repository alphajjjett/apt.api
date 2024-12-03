const Booking = require('../models/booking.model');
const Mission = require('../models/mission.model');
const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { missionId, userId, vehicleId,bookingDate } = req.body;

    // Check if the mission, user, and vehicle exist
    const mission = await Mission.findById(missionId);
    const user = await User.findById(userId);
    const vehicle = await Vehicle.findById(vehicleId);

    if (!mission || !user || !vehicle) {
      return res.status(400).json({ message: 'Invalid mission, user, or vehicle ID' });
    }

    const newBooking = new Booking({
      mission: missionId,
      user: userId,
      vehicle: vehicleId,
      bookingDate
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('mission user vehicle');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    // Ensure status is valid
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
};
