const dotenv = require("dotenv")
dotenv.config();
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser")

// MiddleWare
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use("/api/user", require("./src/routes/user.routes"));
app.use("/api/leaderboard", require("./src/routes/leaderboard.routes"))

module.exports = app;