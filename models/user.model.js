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
            type : string,
            required : true
        }

    },
    {
        timestamps : true
    }


);

const User = mongoose.model("User", UserSchema);
module.exports = User;