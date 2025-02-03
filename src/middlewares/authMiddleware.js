const jwt = require("jsonwebtoken");
const BlacklistTokenModel = require("../models/blacklistToken.model");
const mongoose  = require("mongoose");
const User = require("../models/User");

const authUser = async (req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if(!token)
        return res.status(401).json({message:"Access denied. No token provided"})
    
    const isBlacklisted = await BlacklistTokenModel.findOne({token});
    if(isBlacklisted)
        return res.status(401).json({message:"Unauthorized"})

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        
        const userId = new mongoose.Types.ObjectId(decoded._id)
        
        const user = await User.findOne(userId)
        if(!user)
            return res.status(401).json({message:"No such user exists"})
        req.user = user;
        next()
    } catch (error) {
        res.status(500).json({message:"Invalid token"})
    }
}
module.exports = authUser