const User = require('../models/user.model');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// Create a new user
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const newUser = new User({ name, email, password, role });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

const getUserById = async (req, res) =>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        if(!user) {
            return res.status(404).json({message : "User not found !"});
        }
        res.status(200).json(user);
    }catch (error){
        res.status(500).json({meaage : error.message});
    }
};


module.exports = { getAllUsers, 
                    createUser, 
                    getUserById 
                };
