const mongoose = require('mongoose');
const {Schema} = mongoose;

const BookingStatusSchema = new Schema(
    {
        booking_id: {
            type : Schema.Types.ObjectId,
            ref : 'Booking',
            required : true
        },
        status : {
            type : String,
            enum : ['approved', 'rejected'],
            default : 'approved',
            required : true
        },
        update_by :{
            type : Schema.Types.ObjectId,
            ref : 'Admin',
            required : true

        },
        remark : {
            type : String,
            required : false

        }
    },
    {
        timestamps : true
    }
);

const BookingStatus = mongoose.model('BookingStatus', BookingStatusSchema);
module.exports = BookingStatus;