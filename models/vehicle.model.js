const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        license_plate: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        fuel_type: {
            type: String,
            required: true
        },
        fuel_capacity: {
            type: Number,
            default: 80 // Set the default fuel capacity to 80 liters
        },
        status: {
            type: String,
            enum: ['available', 'in-use', 'maintenance'],
            default: 'available'
        }
    },
    {
        timestamps: true
    }
);

const Vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = Vehicle;
