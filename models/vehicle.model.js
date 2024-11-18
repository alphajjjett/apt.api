const mongoose = require('mongoose');

const VehicleSchema = mongoose.Schema(
    {
        license_plate : {
            type : String,
            required : true

        },
        model : {
            type: String,
            required : true
        },
        fuel_type : {
            type : String,
            required : ture

        },
        status : {
            type : String,
            enum : [
                'available', 
                'in-use',
                'maintenace'
            ],
            default : 'available'
        }

    },
    {
        timestamps : true
    }


);

const Vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = Vehicle;