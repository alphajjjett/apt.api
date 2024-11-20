const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema(
    {
        name : {
            type: String,
            required : true
        },
        password : {
            String,
            required : true
        },
        email : {
            type : String,
            required : true,
            unique : true
        },
        role : {
            type : String,
            enum : ['user', 'admin'],
            default : 'admin'

        },
        password : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }

);

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;