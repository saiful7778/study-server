const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const serverError = require("../utility/serverError");
const { assignmentColl } = require("../db/mongoDB");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { ObjectId } = require("mongodb");

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
      res.status(201).send({ success: true, itemId: result.insertedId });
    } else {
      res.status(400).send({ success: false });
    }
  }, res);
});

route.get("/:assignmentID", verifyToken, verifyTokenAndKey, (req, res) => {
  const assignmentID = req.params.assignmentID;
  serverError(async () => {
    const query = { _id: new ObjectId(assignmentID) };
    const result = await assignmentColl.findOne(query);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(400).send({ message: false });
    }
  }, res);
});

module.exports = route;
