const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const serverError = require("../utility/serverError");
const { assignmentColl, submitAssignmentColl } = require("../db/mongoDB");
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

// route.get("/submit", verifyToken, verifyTokenAndKey, (req, res) => {
//     serverError(async () => {
//         const query = { _id: new ObjectId(assignmentID) };
//         const result = await submitAssignmentColl.findOne(query);
//         if (!result) {
//           return res.status(404).send({ message: false });
//         }
//         res.status(200).send(result);
//       }, res);
// });
route.post("/submit", verifyToken, verifyTokenAndKey, (req, res) => {
  const submittedData = req.body;
  const { adminEmail, adminUid, submission } = submittedData || {};
  serverError(async () => {
    const query = {
      adminEmail: adminEmail,
      adminUid: adminUid,
    };
    const checking = await submitAssignmentColl.findOne(query);
    if (checking) {
      const exist = await submitAssignmentColl.findOne({
        "submission.assignmentID": submission.assignmentID,
      });
      if (exist) {
        res.status(400).send("assignment already submitted");
      } else {
        const result = await submitAssignmentColl.updateOne(
          query,
          {
            $push: { submission: submission },
          },
          { upsert: true }
        );
        if (!result) {
          return res.status(404).send({ success: false });
        }
        res.status(200).send({ success: true, result });
      }
    } else {
      const result = await submitAssignmentColl.insertOne({
        adminEmail,
        adminUid,
        submission: [submission],
      });
      if (result.acknowledged) {
        res.status(201).send({ success: true, itemId: result.insertedId });
      } else {
        res.status(400).send({ success: false });
      }
    }
  }, res);
});

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

assignmentsRoute.get("/q", (req, res) => {
  const level = req.query?.level;
  serverError(async () => {
    const query = { level: level };
    const result = await assignmentColl.find(query).toArray();
    if (!result) {
      return res.status(404).send({ message: false });
    }
    res.status(200).send(result);
  }, res);
});

module.exports = { assignmentRoute, assignmentsRoute };
