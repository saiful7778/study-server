const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const serverError = require("../utility/serverError");
const { assignmentColl } = require("../db/mongoDB");
const verifyTokenAndKey = require("../middleware/verifyTokenKey");
const { ObjectId } = require("mongodb");

const route = express.Router();
const assignmentsRoute = express.Router();

// create new assignment route
route.post("/new", verifyToken, verifyTokenAndKey, (req, res) => {
  const assignmentData = req.body;
  serverError(async () => {
    const result = await assignmentColl.insertOne(assignmentData);
    if (result.acknowledged) {
      res.status(201).send({ success: true, itemId: result.insertedId });
    } else {
      res.status(400).send({ success: false });
    }
  }, res);
});

// get all own create assignment data
route.get("/own", verifyToken, verifyTokenAndKey, (req, res) => {
  const keyEmail = req.query?.email;
  serverError(async () => {
    const query = {
      "admin.email": keyEmail,
    };
    const result = await assignmentColl.find(query).toArray();
    if (!result) {
      return res.status(404).send({ message: false });
    }
    res.status(200).send(result);
  }, res);
});

// update assignment data
route.patch(
  "/update/:assignmentId",
  verifyToken,
  verifyTokenAndKey,
  (req, res) => {
    const assignmentID = req.params.assignmentId;
    const keyEmail = req.query?.email;
    const { title, mark, thumbnailUrl, level, des, dueData } = req.body || {};
    serverError(async () => {
      const updatedAssignment = {
        $set: {
          title: title,
          mark: mark,
          thumbnailUrl: thumbnailUrl,
          level: level,
          des: des,
          dueData: dueData,
        },
      };
      const query = {
        _id: new ObjectId(assignmentID),
        "admin.email": keyEmail,
      };
      const result = await assignmentColl.updateOne(query, updatedAssignment, {
        upsert: true,
      });
      if (!result) {
        return res.status(404).send({ message: false });
      }
      res.status(200).send(result);
    }, res);
  }
);

// get single assignment data
route.get("/:assignmentID", verifyToken, verifyTokenAndKey, (req, res) => {
  const assignmentID = req.params.assignmentID;
  serverError(async () => {
    const query = { _id: new ObjectId(assignmentID) };
    const result = await assignmentColl.findOne(query);
    if (!result) {
      return res.status(404).send({ message: false });
    }
    res.status(200).send(result);
  }, res);
});

// delete assignment data
route.delete(
  "/delete/:assignmentID",
  verifyToken,
  verifyTokenAndKey,
  (req, res) => {
    const assignmentID = req.params.assignmentID;
    const keyEmail = req.query?.email;
    serverError(async () => {
      const query = {
        _id: new ObjectId(assignmentID),
        "admin.email": keyEmail,
      };
      const result = await assignmentColl.deleteOne(query);
      if (!result) {
        return res.status(404).send({ message: false });
      }
      res.status(200).send(result);
    }, res);
  }
);

const assignmentRoute = route;

// get all assignments data
assignmentsRoute.get("/", (req, res) => {
  serverError(async () => {
    const result = await assignmentColl.find().toArray();
    if (!result) {
      return res.status(404).send({ message: false });
    }
    res.status(200).send(result);
  }, res);
});

module.exports = { assignmentRoute, assignmentsRoute };
