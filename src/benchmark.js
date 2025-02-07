const autocannon = require("autocannon");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const pidusage = require("pidusage");

const serversDir = path.join(__dirname, "servers");
const TEST_DURATION = 10; // in seconds

const servers = [
  { name: "Express", port: 3000, file: "express.js" },
  { name: "Node HTTP", port: 3001, file: "http.js" },
  { name: "Turbo HTTP", port: 3002, file: "turbo-http.js" },
];

const scenarios = [
  { name: "Low Load", connections: 100, duration: TEST_DURATION },
  { name: "Medium Load", connections: 1000, duration: TEST_DURATION },
  { name: "High Load", connections: 10000, duration: TEST_DURATION },
];

const responseSizes = [
  { name: "Small", path: "/small" },
  { name: "Medium", path: "/medium" },
  { name: "Large", path: "/large" },
];

const totalTestCases = servers.length * scenarios.length * responseSizes.length;

function getResponseSizes() {
  const responses = require("./utils/responses");

  return {
    small: Buffer.byteLength(responses.small),
    medium: Buffer.byteLength(responses.medium),
    large: Buffer.byteLength(responses.large),
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  else return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatNumber(num) {
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function printBenchmarkInfo() {
  const sizes = getResponseSizes();

  console.log("HTTP Servers Benchmark\n");

  console.log("Servers to test:");
  servers.forEach((server) => console.log(`- ${server.name}`));

  console.log("\nLoad scenarios:");
  scenarios.forEach((scenario) =>
    console.log(
      `- ${scenario.name}: ${scenario.connections} concurrent connections`,
    ),
  );

  console.log("\nResponse sizes:");
  console.log(`- Small: ${formatBytes(sizes.small)}`);
  console.log(`- Medium: ${formatBytes(sizes.medium)}`);
  console.log(`- Large: ${formatBytes(sizes.large)}`);

  console.log(`\nEach test runs for ${TEST_DURATION} seconds`);
  console.log("-".repeat(50), "\n");
}

async function runBenchmark(server, scenario, responseSize) {
  const proc = child_process.spawn("node", [`${serversDir}/${server.file}`]);

  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log(`Testing: ${server.name}`);
  console.log(`Scenario: ${scenario.name}`);
  console.log(`Response Size: ${responseSize.name}\n`);

  const result = await autocannon({
    url: `http://localhost:${server.port}${responseSize.path}`,
    connections: scenario.connections,
    duration: scenario.duration,
    pipelining: 1,
  });

  const totalRequests = parseInt(
    (result.requests.average * scenario.duration).toFixed(0),
  );
  const successRate = (
    ((totalRequests - result.errors) / totalRequests) *
    100
  ).toFixed(2);
  const errorRate = ((result.errors / totalRequests) * 100).toFixed(2);

  const stats = await pidusage(proc.pid);
  const memoryUsed = stats.memory / 1024 / 1024;

  console.log("Request Metrics:");
  console.log(`• Throughput: ${formatNumber(result.requests.average)} req/sec`);
  console.log(`• Latency: ${formatNumber(result.latency.average)} ms`);

  console.log("\nTotal Results:");
  console.log(`• Requests: ${formatNumber(totalRequests)}`);
  console.log(`• Successful: ${formatNumber(totalRequests - result.errors)}`);
  console.log(`• Failed: ${formatNumber(result.errors)}`);

  console.log("\nRates:");
  console.log(`• Success Rate: ${successRate}%`);
  console.log(`• Error Rate: ${errorRate}%`);

  console.log("\nResource Usage:");
  console.log(`• Memory: ${formatNumber(memoryUsed)} MB`);

  console.log("\n" + "-".repeat(50) + "\n");
  proc.kill();
  return {
    ...result,
    memoryUsed,
    totalRequests,
    successRate: parseFloat(successRate),
    errorRate: parseFloat(errorRate),
  };
}

async function runAllBenchmarks() {
  console.clear();
  printBenchmarkInfo();

  const results = [];

  for (const server of servers) {
    for (const scenario of scenarios) {
      for (const responseSize of responseSizes) {
        try {
          console.log(`Test Case ${results.length + 1} of ${totalTestCases}\n`);

          const result = await runBenchmark(server, scenario, responseSize);
          results.push({
            server: server.name,
            scenario: scenario.name,
            responseSize: responseSize.name,
            throughput: result.requests.average,
            latency: result.latency.average,
            totalRequests: result.totalRequests,
            errors: result.errors,
            successRate: result.successRate,
            errorRate: result.errorRate,
            memoryUsed: result.memoryUsed.toFixed(2),
          });
        } catch (err) {
          console.error("Error:", err.message);
        }
      }
    }
  }

  console.log("\nFinal Results:");
  console.table(results);

  fs.writeFileSync("benchmark-results.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to benchmark-results.json");
}

runAllBenchmarks().catch(console.error);
