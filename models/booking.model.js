const mongoose = require('mongoose');
const {Schema} = mongoose;

const BookingSchema = new Schema(
    {
        user_id : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        vehicle_id : {
            type : Schema.Types.ObjectId,
            ref : 'Vehicle',
            required : true
        },
        mission_id : {
            type : Schema.Types.ObjectId,
            ref : 'Mission',
            required : true
        },
        start_time : {
            type : Date,
            required : true
        },
        end_time : {
            type : Date,
            required : true
        },
        status : {
            type : String,
            enum : ['pending', 'approved', 'rejected'],
            default : 'pending'
        }

    },
    {
        timestamps : true
    }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;