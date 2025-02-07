const express = require("express");
const app = express();
const responses = require("../utils/responses");

app.get("/small", (_req, res) => {
  res.send(responses.small);
});

app.get("/medium", (_req, res) => {
  res.send(responses.medium);
});

app.get("/large", (_req, res) => {
  res.send(responses.large);
});

app.listen(3000, () => {
  console.log("Express server running on port 3000");
});
