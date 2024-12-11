const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, updateBookingStatus } = require('../controllers/booking.controller');

// Route for creating a new booking
router.post('/', createBooking);

// Route for getting all bookings
router.get('/', getAllBookings);

// Route for updating booking status
router.put('/:bookingId/status', updateBookingStatus);

  

module.exports = router;
