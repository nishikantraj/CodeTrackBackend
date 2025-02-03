const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const hashPassword = require("../utils/hashPassword");
const BlacklistTokenModel = require("../models/blacklistToken.model");

const registerUser = async (req,res)=>{
    
    const {name, userName, email, password} = req.body;
    try {
        //Check if user already exists
        const doesUserNameExist = await User.findOne({userName})
        if(doesUserNameExist)
            return res.status(400).json({message:"UserName already taken."});
        
        const existingUser = await User.findOne({email})
        if(existingUser)
            return res.status(400).json({message:"User already exists"});
        
        // Hashing the password before saving to the database
        const hashedPassword = await hashPassword(password);
        
        //Generate Session key
        const sessionKey = `${userName}-${Math.random().toString(36).substring(2,9)}`;

        //Create and save new user
        const user = new User({ name, userName, email, password:hashedPassword, sessionKey }); 
        await user.save();

        const token = user.generateAuthToken();
        res.cookie("token", token)
        res.status(201).json({message:"User registered successfully", user,token,sessionKey});

    } catch (error) {
        res.status(500).json({message:"Server error", error:error.message})        
    }
};

const loginUser = async (req,res)=>{
    const {email, password}= req.body

    try {
        const user = await User.findOne({email}).select("+password");
        if(!user) return res.status(400).json({message:"User not found"})
        
        //Check password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch)
            return res.status(401).json({message:"Invalid credentails"})
        
        // Generate JWT
        const token = jwt.sign(
            {_id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"24h"}
        )
        res.cookie("token",token);
        res.status(200).json({message:"Login Successful", token})
    } catch (error) {
        res.status(500).json({message:"Server error", error: error.message})   
    }
};

const profile = async(req,res)=>{
    res.status(200).json(req.user);
}
const logoutUser = async(req,res)=>{
    res.clearCookie("token");
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    const blacklist = new BlacklistTokenModel({
        token:token
    });
    blacklist.save();
    res.status(200).json({message:"Logged out Successfully.",user:req.user})
}
module.exports = {registerUser, loginUser, logoutUser, profile}