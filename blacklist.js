// blacklist.js
const blacklist = new Set([
  // Puedes poner IPs aquí, por ejemplo:
  // '127.0.0.1'
]);

function isBlacklisted(ip) {
  return blacklist.has(ip);
}

module.exports = {
  isBlacklisted,
  blacklist
};
