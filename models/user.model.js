const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        name : {
            type: String,
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
            default : 'user'

        },
        password : {
            type : String,
            required : true
        },
        profilePicture: { 
            type: String, default: '' 
        
        },  // เก็บ URL ของภาพโปรไฟล์

    },
    {
        timestamps : true
    }


);

const User = mongoose.model("User", UserSchema);
module.exports = User;