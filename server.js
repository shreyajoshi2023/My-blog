require("dotenv").config();
const express = require("express");
const AWS = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure AWS DynamoDB
const client = new AWS.DynamoDBClient({ region: "us-east-1" }); // Replace with your AWS region
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "BlogPosts"; // DynamoDB table name

// Create a new blog post
app.post("/add-post", async (req, res) => {
  const { Title, Content, Author } = req.body;
  if (!Title || !Content || !Author) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const PostID = Date.now().toString();
  const Timestamp = new Date().toISOString();

  const params = new PutCommand({
    TableName: TABLE_NAME,
    Item: { PostID, Title, Content, Author, Timestamp },
  });

  try {
    await dynamoDB.send(params);
    res.json({ message: "Post created", PostID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all blog posts
app.get("/get-posts", async (req, res) => {
  const params = new ScanCommand({ TableName: TABLE_NAME });
  try {
    const data = await dynamoDB.send(params);
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a blog post
app.delete("/delete-post/:id", async (req, res) => {
  const params = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PostID: req.params.id },
  });

  try {
    await dynamoDB.send(params);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
