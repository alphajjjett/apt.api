const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,  
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'admin'
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

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
