# HTTP Servers Benchmark

A performance comparison between Express.js, Node's HTTP, and Turbo HTTP servers.

## Run
```bash
npm install
npm run benchmark
```
## Overview

This benchmark compares three HTTP server implementations:
- **Express**
- **Node HTTP**
- **Turbo HTTP**

## Test Scenarios

### Load Levels
- **Low Load**: 100 concurrent connections
- **Medium Load**: 1,000 concurrent connections
- **High Load**: 10,000 concurrent connections

### Response Sizes
- **Small**: "Hello World!" (12 bytes)
- **Medium**: 10KB of data
- **Large**: 100KB of data

Each test runs for 10 seconds, measuring:
- Throughput (requests/second)
- Latency (milliseconds)
- Success/Error rates
- Memory usage (MB)

1. **Success Rates**
   - Node HTTP:
     * Low Load: 100% success across all sizes
     * Medium Load: 99.97-100% success
     * High Load: 92-98% success
   - Turbo HTTP:
     * Low/Medium Load: 100% success
     * High Load: 98.95-99.9% success
   - Express:
     * Low Load: 100% success
     * Medium Load: 98.88-99.57% success
     * High Load: 10.71-77.13% success

2. **Performance and Resources**
   - Node HTTP:
     * Good throughput (90K req/s at low load)
     * Consistent memory use (68-231 MB)
     * Best stability under pressure
   - Turbo HTTP:
     * Highest throughput (101K req/s at low load)
     * Higher memory usage (456-752 MB at high load)
     * Very stable success rates
   - Express:
     * Lower throughput (19K req/s at low load)
     * Moderate memory use (126-255 MB)
     * Struggles with high load

3. **Summary**
   - Node HTTP offers the best balance of performance and stability
   - Turbo HTTP excels in raw performance but uses more memory
   - Express is suitable for low to medium traffic applications
