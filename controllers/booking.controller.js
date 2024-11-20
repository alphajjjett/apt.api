const Booking = require('../models/booking.model');


const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

const createBooking = async (req, res) => {
    const { user_id, 
            vehicle_id,
            mission_id,
            start_time,
            end_time,
            status } = req.body;
    try {
        const newBooking = new Booking({ user_id, vehicle_id, mission_id, start_time, end_time, status });
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = { getAllBookings, 
                    createBooking 
                };
