const http = require("http");
const responses = require("../utils/responses");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  switch (req.url) {
    case "/small":
      res.end(responses.small);
      break;

    case "/medium":
      res.end(responses.medium);
      break;

    case "/large":
      res.end(responses.large);
      break;

    default:
      res.end(responses.small);
  }
});

server.listen(3001, () => {
  console.log("HTTP server running on port 3001");
});
