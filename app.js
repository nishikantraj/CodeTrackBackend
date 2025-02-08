const dotenv = require("dotenv")
dotenv.config();
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser");
const { getLeaderboard } = require("./src/controllers/leaderboard.controller");
// MiddleWare
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use("/api/user", require("./src/routes/user.routes"));
app.use("/api/leaderboard", require("./src/routes/leaderboard.routes"))
app.get("/",getLeaderboard)

module.exports = app;