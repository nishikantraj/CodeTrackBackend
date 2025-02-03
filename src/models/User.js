const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// User Schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required: true,
        },
        userName: {
            type:String,
            required: true,
            unique:true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true,
            select:false,
        },
        sessionKey: {
            type: String,
            unique: true,
            required: true,
        },
    }
);

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id},process.env.JWT_SECRET,{expiresIn: '24h'})
    return token;
}

const User = mongoose.model("User", userSchema);
module.exports = User;
