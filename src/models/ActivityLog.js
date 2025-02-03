const mongoose = require("mongoose")


const timeEntrySchema = new mongoose.Schema({
    language:{
        type:String,
        required:true,
    },
    startTime:{
        type:Date,
        required:true,
    },
    endTime:{
        type:Date,
        required:true,
    },
    duration:{  //in milliseconds
        type:Number,
        required:true,
    }
})
const activityLogSchema = new mongoose.Schema(
    {
        sessionKey: {
            type: String,
            ref: "User",
            required: true,
        },
        timeEntries:[timeEntrySchema],
    }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
