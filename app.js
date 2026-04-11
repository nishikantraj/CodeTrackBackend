const dotenv = require("dotenv")
dotenv.config();
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser");
const { getLeaderboard } = require("./src/controllers/leaderboard.controller");


// MiddleWare
app.use(express.json())


const allowedOrigins = ["https://code-champ-nishi.vercel.app","https://www.codechamp.tech", "https://codechamp.tech","http://localhost:5173"];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));


app.use(cookieParser())

app.use("/api/user", require("./src/routes/user.routes"));
app.use("/api/leaderboard", require("./src/routes/leaderboard.routes"))
app.get("/",getLeaderboard)

module.exports = app;