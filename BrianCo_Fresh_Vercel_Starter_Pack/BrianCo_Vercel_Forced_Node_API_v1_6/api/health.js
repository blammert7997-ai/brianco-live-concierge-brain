module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.BRIANCO_ALLOWED_ORIGIN || "https://www.briannco.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.status(200).json({
    ok: true,
    service: "Brian & Co Concierge Backend",
    status: "online",
    version: "1.6-forced-node-api"
  });
};