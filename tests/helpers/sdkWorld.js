// Loads the SDK's built test world (identra-sdk/packages/app/test-dist) for the scripted protocol
// proofs, or explains why they are skipped; and finds a free 127.0.0.1 port (bands within 47340-47349).
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const WORLD = path.resolve(__dirname, '../../../identra-sdk/packages/app/test-dist/helpers/world.js');
const missing = fs.existsSync(WORLD) ? false : `the SDK test world is not built (${WORLD}); build identra-sdk to run this proof`;
const world = missing ? null : require(WORLD);

/** A free port in [first, last]; each proof file uses its own band (node --test runs files in parallel). */
async function freePort(first, last) {
  for (let port = first; port <= last; port++) {
    const free = await new Promise((resolve) => {
      const probe = net.createServer().once('error', () => resolve(false)).once('listening', () => probe.close(() => resolve(true)));
      probe.listen(port, '127.0.0.1');
    });
    if (free) return port;
  }
  throw new Error(`no free port in ${first}-${last}`);
}

module.exports = { missing, world, freePort };
