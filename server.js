const http = require("http");
const app = require("./app")
const connectDB = require("./src/config/db")
const PORT = process.env.PORT || 5001

//Database Connection
connectDB()

//Server listening
const router = http.createServer(app);

router.listen(PORT, ()=>console.log(`Server running on port ${PORT}`))
