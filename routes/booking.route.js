const express = require('express');
const router = express.Router();
const {  getAllBookings, getBookingById,deleteBooking } = require('../controllers/booking.controller');
// const auth = require('../middleware/auth.middleware');

// Route for creating a new booking
// router.post('/', createBooking);

// Route for getting all bookings
router.get('/', getAllBookings);

// Route for updating booking status
router.put('/booking/:id', getBookingById);

router.delete('/:id', deleteBooking);

  

module.exports = router;
