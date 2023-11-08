const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const serverError = require("../utility/serverError");
const { assignmentColl } = require("../db/mongoDB");

const route = express.Router();

route.post("/new", verifyToken, (req, res) => {
  const tokenUser = req.user;
  const keyEmail = req.query?.email;
  const assignmentData = req.body;
  if (tokenUser?.email !== keyEmail) {
    return res.status(400).send({ message: "not accessible" });
  }
  serverError(async () => {
    const result = await assignmentColl.insertOne(assignmentData);
    if (result.acknowledged) {
      res.status(201).send({ success: true });
    } else {
      res.status(400).send({ success: false });
    }
  }, res);
});

module.exports = route;
