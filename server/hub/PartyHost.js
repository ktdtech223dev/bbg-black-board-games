const os = require('os');

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

function buildJoinURL(lobbyCode, port = 3847) {
  const ip = getLocalIP();
  return `http://${ip}:${port}/join/${lobbyCode}`;
}

module.exports = { getLocalIP, buildJoinURL };
