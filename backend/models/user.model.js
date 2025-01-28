const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        selfid: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        password: {
            type: String,
            required: true
        },
        description: {  
            type: String,
            default: ''  
        },
        profileImage: {  
            type: String,
            default: ''  
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
