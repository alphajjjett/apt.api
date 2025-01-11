const Return = require('../models/return.model');
const Mission = require('../models/mission.model');
const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');

// Create a return record
const createReturn = async (req, res) => {
  const { missionId } = req.params; // missionId is passed in the URL
  const { returnDate, returnStatus, description } = req.body;

  try {
    // Find the related mission, user, and vehicle
    const mission = await Mission.findById(missionId).populate('assigned_user_id assigned_vehicle_id');
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    const user = mission.assigned_user_id;
    const vehicle = mission.assigned_vehicle_id;

    // Create a new return record
    const returnRecord = new Return({
      mission: mission._id,  // Store the mission ID
      user: user._id,        // Store the user ID
      vehicle: vehicle._id,  // Store the vehicle ID
      bookingDate: mission.start_date, // Automatically use mission's start_date
      returnDate: returnDate || new Date(),  // Default to current date if not provided
      returnStatus: returnStatus || 'pending', // Default to 'pending'
      description: description || '',  // Optional description
    });

    // Save the return record
    await returnRecord.save();

    // Update the mission status to 'completed'
    mission.status = 'completed';
    await mission.save();

    // Respond with the new return record
    res.status(200).json(returnRecord);
  } catch (error) {
    res.status(500).json({ error: 'Error processing return' });
  }
};

// Get all return records
const getAllReturns = async (req, res) => {
  try {
    // Use populate to include mission, user, and vehicle details
    const returns = await Return.find()
      .populate('mission')    // Populate mission details
      .populate('user')       // Populate user details
      .populate('vehicle');   // Populate vehicle details

    res.status(200).json(returns);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch returns', error });
  }
};

// Update an existing return record
const updateReturn = async (req, res) => {
  const { returnDate, returnStatus, description } = req.body;
  const returnId = req.params.id; // The return record ID

  try {
    const returnRecord = await Return.findById(returnId);
    if (!returnRecord) {
      return res.status(404).json({ message: 'Return record not found' });
    }

    returnRecord.returnDate = returnDate || returnRecord.returnDate;
    returnRecord.returnStatus = returnStatus || returnRecord.returnStatus;
    returnRecord.description = description || returnRecord.description;

    await returnRecord.save();

    // Optionally, update mission status if return is completed
    if (returnStatus === 'completed') {
      const mission = await Mission.findById(returnRecord.mission);
      if (mission) {
        mission.status = 'completed';
        await mission.save();
      }
    }

    res.status(200).json({ message: 'Return updated successfully', return: returnRecord });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update return', error });
  }
};

module.exports = { createReturn, getAllReturns, updateReturn };
