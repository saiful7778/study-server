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
          mark: parseFloat(mark),
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

route.get("/submit", verifyToken, verifyTokenAndKey, (req, res) => {
  const { email, idtok } = req.query;
  serverError(async () => {
    const query = {
      "submission.userEmail": email,
      "submission.userUid": idtok,
    };
    const projection = {
      thumbnailUrl: 1,
      title: 1,
      _id: 1,
      mark: 1,
      level: 1,
      dueData: 1,
      submission: 1,
    };
    const result = await assignmentColl
      .find(query)
      .project(projection)
      .toArray();
    if (!result) {
      return res.status(404).send({ message: false });
    }
    res.status(200).send(result);
  }, res);
});

route.get("/submitted", verifyToken, verifyTokenAndKey, (req, res) => {
  const query = {
    submission: {
      //   $elemMatch: {
      //     "submittedData.status": "pending",
      //   },
      $exists: true,
    },
  };
  const projection = {
    title: 1,
    _id: 1,
    mark: 1,
    level: 1,
    dueData: 1,
    submission: 1,
  };
  serverError(async () => {
    const submissionData = await assignmentColl
      .find(query)
      .project(projection)
      .toArray();
    if (!submissionData) {
      return res.status(404).send({ success: false });
    }
    res.status(200).send(submissionData);
  }, res);
});

route.patch(
  "/submit/:assignmentId",
  verifyToken,
  verifyTokenAndKey,
  (req, res) => {
    const assignmentId = req.params.assignmentId;
    const { idtok } = req.query;
    const { mark, status, userEmail } = req.body;
    const query = {
      _id: new ObjectId(assignmentId),
      submission: {
        $elemMatch: {
          userEmail: userEmail,
          userUid: idtok,
        },
      },
    };
    serverError(async () => {
      const result = await assignmentColl.findOne(query);
      if (result) {
        const updateMark = {
          $set: {
            "submission.$.submittedData.status": status,
            "submission.$.submittedData.mark": mark,
          },
        };
        const result = await assignmentColl.updateOne(query, updateMark);
        res.send(result);
      } else {
        res.status(404).send({ success: false });
      }
    }, res);
  }
);

route.get(
  "/submit/:assignmentId",
  verifyToken,
  verifyTokenAndKey,
  (req, res) => {
    const assignmentId = req.params.assignmentId;
    const { idtok } = req.query;
    serverError(async () => {
      const query = {
        _id: new ObjectId(assignmentId),
      };
      const result = await assignmentColl.findOne(query);
      if (result) {
        const { submission } = result;
        const remain = submission?.filter((ele) => ele.userUid === idtok);
        const data = remain[0];
        if (!remain) {
          return res.status(404).send({ success: false });
        }
        res.status(200).send(data.submittedData);
      } else {
        res.status(404).send({ success: false });
      }
    }, res);
  }
);

route.post("/submit", verifyToken, verifyTokenAndKey, (req, res) => {
  const {
    assignmentID,
    userEmail,
    userName,
    userUid,
    userProfile,
    submittedData,
  } = req.body;
  serverError(async () => {
    const query = {
      _id: new ObjectId(assignmentID),
    };
    const checking = await assignmentColl.findOne(query);
    if (checking) {
      const exist = await assignmentColl.findOne({
        ...query,
        "submission.userEmail": userEmail,
        "submission.userUid": userUid,
      });
      if (exist) {
        res.status(400).send("assignment already submitted");
      } else {
        const addSubmission = {
          $push: {
            submission: {
              userEmail: userEmail,
              userUid: userUid,
              userName: userName,
              userProfile: userProfile,
              submittedData: {
                ...submittedData,
                status: "pending",
              },
            },
          },
        };
        const result = await assignmentColl.updateOne(query, addSubmission, {
          upsert: true,
        });
        if (!result) {
          return res.status(404).send({ success: false });
        }
        res.status(200).send({ success: true, result });
      }
    } else {
      res.status(404).send({ success: false });
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
