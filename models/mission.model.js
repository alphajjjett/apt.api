const mongoose = require('mongoose');

const MissionSchema = mongoose.Schema(
    {
        mission_name : {
    
        },
        description : {
        
        },
        status : {


        },
        assigned_vehicle_id : {
            
        },
        assigned_user_id : {

        }
    },
    {
        timestamps : true
    }


);

const Mission = mongoose.model("Mission", MissionSchema);
module.exports = Mission;