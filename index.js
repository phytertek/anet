const httpReq = require('axios');
const portFinder = require('portfinder');
const bodyParser = require('body-parser');
const network = require('./network');
const server = require('express')();
server.use(bodyParser.json());
let origin, host, next, port;
const interval = 500;

const networkRemoveNode = async n => {
  try {
    network.copy().forEach(node => {
      try {
        if (node !== host && node !== origin)
          httpReq.post(`${node}remove-node`, { node: n });
      } catch (error) {
        throw new Error(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const pollRun = async () => {
  try {
    clearInterval(poller);
    await checkNeighbor();
  } catch (error) {
    console.log(error);
  }
};

const checkNeighbor = async () => {
  try {
    console.log('Send Check', network.copy());
    next = network.nextNode();
    if (next !== host) {
      const neighborResponse = await httpReq.post(`${next}check`, {
        host,
        network: network.copy()
      });
    }
    poller = setInterval(pollRun, interval);
  } catch (error) {
    network.removeNode(next);
    networkRemoveNode(next);
    poller = setInterval(pollRun, interval);
  }
};

let poller = setInterval(pollRun, interval);

server.post('/check', async (req, res) => {
  try {
    console.log('Recieve Check', network.copy());
    const origin = req.body.host;
    const originNetwork = req.body.network;
    network.addNode(origin);
    network.merge(originNetwork);
    res.json({ host, network: network.copy() });
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
    const hostName = process.argv[3] || process.env.HOST || 'http://0.0.0.0';
    port =
      process.argv[2] ||
      process.env.PORT ||
      (await portFinder.getPortPromise());
    host =
      process.argv[3] || process.env.HOST ? hostName : `${hostName}:${port}/`;
    origin = process.argv[4] || process.env.ORIGIN || 'http://0.0.0.0:3000/';

    network.init(origin, host);
    server.listen(port, () => {
      console.log('*** Host:', host);
      console.log('Server running on port', port);
    });
  } catch (error) {
    return console.log(err);
  }
};

start();
