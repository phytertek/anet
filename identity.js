let hostName, port, host, origin;

const getIdentity = {
  hostName: process.argv[3] || process.env.HOST || 'http://0.0.0.0',
  port: process.argv[2] || process.env.PORT,
  origin: process.argv[4] || process.env.ORIGIN || 'http://0.0.0.0:8000/'
};

module.exports = getIdentity;
