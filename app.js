const dotenv = require("dotenv")
dotenv.config();
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser");
const { getLeaderboard } = require("./src/controllers/leaderboard.controller");

const allowedOrigins = [
    "https://code-track-frontend.vercel.app",
    "http://localhost:5173",
  ];
// MiddleWare
app.use(express.json())


app.use(
    cors({
      origin: allowedOrigins,
      credentials: true, 
    })
);

app.use(cookieParser())

app.use("/api/user", require("./src/routes/user.routes"));
app.use("/api/leaderboard", require("./src/routes/leaderboard.routes"))
app.get("/",getLeaderboard)

module.exports = app;