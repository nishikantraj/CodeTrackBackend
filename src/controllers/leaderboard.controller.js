const cron = require("node-cron")
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

const leaderboardCreate = async(req,res)=>{
    const {language, sessionKey,startTime, endTime, duration} = req.body;
    if (!language || !sessionKey || !startTime || !endTime || !duration) {
        return res.status(400).json({ message: "Language, sessionKey, startTime, endTime, and duration are required." });
    }
    
    try {
         // Validate the sessionKey against the User collection
         const user = await User.findOne({ sessionKey });

         if (!user) {
             return res.status(401).json({ message: "Invalid session key. User does not exist." });
         }

        let activityLog = await ActivityLog.findOne({sessionKey});

        if(!activityLog){
            activityLog = new ActivityLog({
                sessionKey,
                timeEntries:[],
            });
        }
        activityLog.timeEntries.push({language, startTime, endTime, duration});
        activityLog.save()
        res.status(200).json({message:"Activity log updated successfully.",activityLog});
    } catch (error) {
        res.status(500).json({messgae:"Serven error",error:error.message});
    }
}

// Get leaderboard for last 24 hour
const getLeaderboard = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const activityLogs = await ActivityLog.find({});
        
        const leaderboard = activityLogs.map(log => {
            const recentEntries = log.timeEntries.filter(entry => {
                return new Date(entry.endTime) > twentyFourHoursAgo;
            });

            const languageDurations = {};
            recentEntries.forEach(entry => {
                if (!languageDurations[entry.language]) {
                    languageDurations[entry.language] = 0;
                }
                languageDurations[entry.language] += entry.duration;
            });

            return {
                sessionKey: log.sessionKey,
                languages: Object.entries(languageDurations).map(([language, duration]) => ({
                    language,
                    minutes: (duration / 60000).toFixed(2) // convert to minutes
                }))
            };
        });

        res.status(200).json({message:"Data retrieved successfully", leaderboard });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Atuo cleanup logic
const cleanUpOldEntries = async()=>{
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    try {
        const activityLogs = await ActivityLog.find({});
        for(log of activityLogs){
            //Filter out time entries older than 24-hr
            log.timeEntries = log.timeEntries.filter(entry => new Date(entry.endTime) > twentyFourHoursAgo)
            await log.save();
        }
        console.log("Old entries cleaned up successfully.");
    } catch (error) {
        console.error("Error during cleanup:", error);        
    }
}

cron.schedule("* * * * *", cleanUpOldEntries);

module.exports = {leaderboardCreate, getLeaderboard};