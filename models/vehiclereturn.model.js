const mongoose = require('mongoose');
const {Schema} = mongoose;

const VehicleReturnSchema = new Schema(
    {
        booking_id : {
            type : Schema.Types.ObjectId,
            ref : 'Booking',
            required : true    
        },
        vehicle_id : {
            type : Schema.Types.ObjectId,
            ref : 'Vehicle',
            required : true

        },
        user_id : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true

        },
        return_date : {
            type : Date,
            required : true
        },
        condition : {
            type : String,
            required : true
        },
        fuel_level : {
            type : Number,
            required : true

        },
        remark : {
            type : String,
            required : true
        },
    },
    {
        timestamps : true
    }
);

const VehicleReturn = mongoose.model("VehicleReturn", VehicleReturnSchema);
module.exports = VehicleReturn;