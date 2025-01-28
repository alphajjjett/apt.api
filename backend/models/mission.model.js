const mongoose = require('mongoose');
const {Schema} = mongoose;

const MissionSchema = new Schema(
    {
        mission_name : {
            type : String,
            required : true
        },
        description : {
            type  : String,
            required : true
        
        },
        status : {
            type : String,
            enum : ['pending','in-progress','completed','cancel'],
            deafault : 'pending'

        },
        quantity : {
            type  : Number,
            required : true
        
        },
        assigned_vehicle_id : {
            type : Schema.Types.ObjectID,
            ref : 'Vehicle',            
            required : true

        },
        assigned_user_id : {
            type : Schema.Types.ObjectID,
            ref : 'User',
            required : true
        },
        start_date: { 
            
            type: Date, required: true 

        }, 
         end_date: { 
            
            type: Date, required: true 

         },
    },
    {
        timestamps : true
    }


);

const Mission = mongoose.model("Mission", MissionSchema);
module.exports = Mission; 