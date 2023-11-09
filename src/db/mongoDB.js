const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.CONNECT_LINK;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const studyDB = client.db("studyDB");
const assignmentColl = studyDB.collection("assignmentColl");
const userColl = studyDB.collection("userColl");

module.exports = { assignmentColl, userColl };
