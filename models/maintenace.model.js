const mongoose = require('mongoose');
const {Schema} = mongoose ;

const MaintenaceSchema = new Schema(
    {
        vehicle_id : {
            type : Schema.Types.ObjectId,
            ref : 'Vehicle',
            required : true
        },
        description : {
            type : String,
            required : false    
     },
        maintenace_date : {
            type : Date,
            required : true

        },
        next_due : {    
            type : Date,
            required : true

        }

    },
    {
        timestapmes : true 
    }
);

const Matintenace = mongoose.model("Maintenace", MaintenaceSchema);
module.exports = Maintenace;