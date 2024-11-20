const BookingStatus = require('../models/bookingstatus.model');


const getAllBookingStatuses = async (req, res) => {
    try {
        const bookingStatuses = await BookingStatus.find();
        res.status(200).json(bookingStatuses);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};


const createBookingStatus = async (req, res) => {
    const { booking_id, 
            status, 
            update_by, 
            remark } = req.body;

    try {
        const newBookingStatus = new BookingStatus({ booking_id, status, update_by, remark });
        await newBookingStatus.save();
        res.status(201).json(newBookingStatus);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = { getAllBookingStatuses, 
                    createBookingStatus 
                };
