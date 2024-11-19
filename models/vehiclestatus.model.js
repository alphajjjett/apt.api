const mongoose = require ('mongoose');
const {Schema} = mongoose ;

const VehicleStatusSchema = new Schema(
    {
        vehicle_id : {
            type : Schema.Types.ObjectId,
            ref : 'Vehicle',
            required : true
        },
        status : {
            type : String,
            enum : ['available', 'in-use', 'maintenace'],
            default : 'available',
            required : true

        },
    },
    {
        timestamps : true
    }
);

const VehicleStatus = mongoose .model("VehicleStatus", VehicleStatusSchema);
module.exports = VehicleStatus;