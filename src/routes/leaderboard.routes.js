const express = require("express");
const router = express.Router();
const { leaderboardCreate, getLeaderboard } = require("../controllers/leaderboard.controller");

//Endpoint to update activity log
router.post("/activity",leaderboardCreate)

//Endpoint to retrieve the data from db
router.get("/board", getLeaderboard)

module.exports = router;