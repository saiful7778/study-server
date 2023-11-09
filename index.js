const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// server listening port
const port = process.env.PORT || 5001;

// all routes
const jwtAuthRoute = require("./src/routes/jwtAuth");
const {
  assignmentRoute,
  assignmentsRoute,
} = require("./src/routes/assignment");

// main application component
const app = express();
// add middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://study-72c82.web.app"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    status: "server is running",
  });
});

app.use("/jwtauth", jwtAuthRoute);
app.use("/assignments", assignmentsRoute);
app.use("/assignment", assignmentRoute);

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
