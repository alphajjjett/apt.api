const Mission = require('../models/mission.model');

const getAllMissions = async (req, res) => {
    try{
        const missions = await Mission.find();
        res.status(200).json(missions);
    }catch(error){
        res.status(500).json({message : error.message});
    }
}
;
const createMission = async (req, res)=> {
    
    const { mission_name, 
            description, 
            status, 
            assigned_vehicle_id, 
            assigned_user_id } = req.body;
    
    try{
        const newMission = new Mission({ mission_name, description, status, assigned_vehicle_id, assigned_user_id });
        await newMission.save(Mission);
        res.status(200).json(newMission);
    }catch(error){
        res.status(500).json({message : error.message});

    }
};


module.exports = {
    getAllMissions,
    createMission
};