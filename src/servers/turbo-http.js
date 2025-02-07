const turbo = require("turbo-http");
const responses = require("../utils/responses");

Object.keys(responses).forEach(
  (key) => (responses[key] = Buffer.from(responses[key])),
);

const server = turbo.createServer((req, res) => {
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

server.listen(3002, () => {
  console.log("Turbo HTTP server running on port 3002");
});
