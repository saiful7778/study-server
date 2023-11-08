const express = require("express");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
require("dotenv").config();

const route = express.Router();

route.post("/", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
  res
    .cookie("token", token, { httpOnly: true, secure: false })
    .send({ success: true });
});

route.post("/logout", async (req, res) => {
  res
    .clearCookie("token", { maxAge: 0, secure: false })
    .send({ success: true });
});

// verfiy jwt token
route.get("/verfiy", verifyToken, (req, res) => {
  const user = req.user;
  const queryUser = req.query?.email;
  if (user?.email !== queryUser) {
    return res.status(400).send({ message: "not accessible" });
  }
  res.send({ message: "authorized" });
});

module.exports = route;
