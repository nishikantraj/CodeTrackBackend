const cron = require("node-cron")
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

// const leaderboardCreate = async(req,res)=>{
//     const {language, sessionKey,startTime, endTime, duration} = req.body;
//     if((duration / 1000) > 900){
//         return res.status(400).json({message:"Duration is too long. Maximum duration is 15 minutes."});
//     }
//     if (!language || !sessionKey || !startTime || !endTime || !duration) {
//         return res.status(400).json({ message: "Language, sessionKey, startTime, endTime, and duration are required." });
//     }
    
//     try {
//          // Validate the sessionKey against the User collection
//          const user = await User.findOne({ sessionKey });

//          if (!user) {
//              return res.status(401).json({ message: "Invalid session key. User does not exist." });
//          }

//         let activityLog = await ActivityLog.findOne({sessionKey});

//         if(!activityLog){
//             activityLog = new ActivityLog({
//                 sessionKey,
//                 timeEntries:[],
//             });
//         }
//         activityLog.timeEntries.push({language, startTime, endTime, duration});
//         activityLog.save()
//         res.status(200).json({message:"Activity log updated successfully.",activityLog});
//     } catch (error) {
//         res.status(500).json({messgae:"Serven error",error:error.message});
//     }
// }

// const leaderboardCreate = async (req, res) => {
//     const { language, sessionKey, startTime, endTime, duration } = req.body;

//     // Validate duration (should not exceed 15 minutes)
//     if ((duration / 1000) > 900) {
//         return res.status(400).json({ message: "Duration is too long. Maximum duration is 15 minutes." });
//     }

//     // Check for required fields
//     if (!language || !sessionKey || !startTime || !endTime || !duration) {
//         return res.status(400).json({ message: "Language, sessionKey, startTime, endTime, and duration are required." });
//     }

//     try {
//         // Validate the sessionKey against the User collection
//         const user = await User.findOne({ sessionKey });

//         if (!user) {
//             return res.status(401).json({ message: "Invalid session key. User does not exist." });
//         }

//         let activityLog = await ActivityLog.findOne({ sessionKey });

//         if (!activityLog) {
//             // If no activity log exists, create a new one
//             activityLog = new ActivityLog({
//                 sessionKey,
//                 timeEntries: [],
//             });
//         } else {
//             // Check if the exact same entry already exists
//             const isDuplicate = activityLog.timeEntries.some(entry =>
//                 entry.language === language &&
//                 entry.startTime === startTime &&
//                 entry.endTime === endTime &&
//                 entry.duration === duration
//             );

//             if (isDuplicate) {
//                 return res.status(409).json({ message: "Duplicate entry detected. Entry not added." });
//             }
//         }

//         // Add the new entry
//         activityLog.timeEntries.push({ language, startTime, endTime, duration });
        
//         // Save the updated activity log
//         await activityLog.save();

//         res.status(200).json({ message: "Activity log updated successfully.", activityLog });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

const leaderboardCreate = async (req, res) => {
    const { language, sessionKey, startTime, endTime, duration } = req.body;

    if (duration / 1000 > 900) {
        return res.status(400).json({ message: "Duration is too long. Maximum duration is 15 minutes." });
    }

    if (!language || !sessionKey || !startTime || !endTime || !duration) {
        return res.status(400).json({ message: "Language, sessionKey, startTime, endTime, and duration are required." });
    }

    if (new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({ message: "Invalid time range. endTime must be greater than startTime." });
    }

    try {
        const user = await User.findOne({ sessionKey });
        if (!user) {
            return res.status(401).json({ message: "Invalid session key. User does not exist." });
        }

        // Find the activity log first to avoid duplicate DB queries
        let activityLog = await ActivityLog.findOne({ sessionKey });

        if (!activityLog) {
            activityLog = new ActivityLog({ sessionKey, timeEntries: [] });
        } else {
            // Efficient in-memory duplicate check
            const isDuplicate = activityLog.timeEntries.some(entry =>
                entry.language === language &&
                new Date(entry.startTime).getTime() === new Date(startTime).getTime() &&
                new Date(entry.endTime).getTime() === new Date(endTime).getTime() &&
                entry.duration === duration
            );

            if (isDuplicate) {
                return res.status(409).json({ message: "Duplicate entry detected. Entry not added." });
            }
        }

        // Add the new entry
        activityLog.timeEntries.push({ language, startTime, endTime, duration });

        // Save the updated activity log
        await activityLog.save();

        res.status(200).json({ message: "Activity log updated successfully.", activityLog });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get leaderboard for last 24 hour
const getLeaderboard = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Fetch all activity logs
        const activityLogs = await ActivityLog.find({});

        // Aggregate entries by sessionKey
        const sessionMap = new Map();

        activityLogs.forEach(log => {
            if (!sessionMap.has(log.sessionKey)) {
                sessionMap.set(log.sessionKey, []);
            }
            sessionMap.get(log.sessionKey).push(...log.timeEntries);
        });

        // Process leaderboard data
        const leaderboard = await Promise.all(Array.from(sessionMap.entries()).map(async ([sessionKey, timeEntries]) => {
            const recentEntries = timeEntries.filter(entry => new Date(entry.endTime) > twentyFourHoursAgo);

            const languageDurations = {};
            recentEntries.forEach(entry => {
                if (!languageDurations[entry.language]) {
                    languageDurations[entry.language] = 0;
                }
                languageDurations[entry.language] += entry.duration;
            });
            const user = await User.findOne({sessionKey});
            
            return {
                name: user.name,
                languages: Object.entries(languageDurations).map(([language, duration]) => ({
                    language,
                    minutes: (duration / 60000).toFixed(2) // convert to minutes
                }))
            };
        }));

        res.status(200).json({ message: "Data retrieved successfully", leaderboard });
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