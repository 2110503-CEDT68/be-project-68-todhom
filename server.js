const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

const app = express();

//Query parser
app.set("query parser", "extended");

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Route files
const providers = require("./routes/providers");
const auth = require("./routes/auth");
const rentals = require("./routes/rentals");

//Mount routers
app.use("/api/v1/providers", providers);
app.use("/api/v1/auth", auth);
app.use("/api/v1/rentals", rentals);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT,
  ),
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server & exit
  server.close(() => process.exit(1));
});
