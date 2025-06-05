const blacklist = new Set([
  // Aqui poner la IP que quiero banear
  // '127.0.0.1'
]);

function isBlacklisted(ip) {
  return blacklist.has(ip);
}

module.exports = {
  isBlacklisted,
  blacklist
};
