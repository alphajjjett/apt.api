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
    const { bookingId } = req.params;  // Get bookingId from URL parameters
    const { status } = req.body;  // Get new status from request body

    // Find the booking by ID and update its status
    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);  // Return the updated booking
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status' });
  }
};

// Controller for deleting a booking by ID
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params; // Get the booking ID from the route params
    const booking = await Booking.findById(id); // Find the booking by ID

    if (!booking) {
      // If the booking doesn't exist, return 404 error
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.remove(); // Remove the booking from the database
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    // Handle any server errors
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking
};
