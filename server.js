const portFinder = require('portfinder');
const identity = require('./identity');
const network = require('./network');
const bodyParser = require('body-parser');
const server = require('express')();
server.use(bodyParser.json());

server.post('/check', async (req, res) => {
  try {
    console.log('Recieve Check', network.copy());
    const origin = req.body.host;
    const originNetwork = req.body.network;
    network.merge(originNetwork);
    res.json({ host: identity.host, network: network.copy() });
  } catch (error) {
    res.json(error);
  }
});

server.post('/remove-node', async (req, res) => {
  try {
    network.removeNode(req.body.node);
    res.sendStatus(200);
  } catch (error) {
    res.json(error);
  }
});

const start = async () => {
  try {
    const port = identity.port || (await portFinder.getPortPromise());
    const host =
      identity.hostName === 'http://0.0.0.0'
        ? `${identity.hostName}:${port}/`
        : identity.hostName;
    network.init(identity.origin, host);
    server.listen(port, () => {
      console.log('*** Host:', host);
      console.log('Server running on port', port);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
