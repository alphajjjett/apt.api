const mongoose = require('mongoose');
const {Schema} = mongoose;

const FuelSchema = new Schema(
    {
        vehicle_id  : {
            type : Schema.Types.ObjectId,
            ref : 'Vehicle',
            required : true
        },
        fuel_type : {
            type : String,
            required : true

        },
        amount : {

            type : Number,
            required : true

        }

    },
    {
        timestamps : true
    }
);


const Fuel = mongoose.model("Fuel", FuelSchema);
module.exports = Fuel;