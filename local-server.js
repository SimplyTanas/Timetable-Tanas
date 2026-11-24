// Backward-compatible entrypoint forwarding to unified production server.js
const { startServer } = require('./server');

if (require.main === module) {
  startServer();
}
