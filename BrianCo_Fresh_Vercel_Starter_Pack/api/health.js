module.exports = function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "Brian & Co Concierge Backend",
    status: "online"
  });
};
