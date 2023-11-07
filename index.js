const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// server listening port
const port = process.env.PORT || 5001;

// main application component
const app = express();
// add middleware
app.use(
  cors({
    origin: ["http://localhost:"],
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

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
