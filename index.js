const httpReq = require('axios');
const bodyParser = require('body-parser');
const server = require('express')();
server.use(bodyParser.json());

const origin = 'https://ane1.herokuapp.com/'; // 'http://0.0.0.0'
const hostName = process.argv[3] || process.env.HOST; // 'http://0.0.0.0';
const port = process.argv[2] || process.env.PORT; // 3000;
const host = `${hostName}`;

const network = require('./network');

const pollRun = async () => {
  try {
    clearInterval(poller);
    await checkNeighbor();
  } catch (error) {
    console.log(error);
  }
};

let next;

const checkNeighbor = async () => {
  try {
    next = network.nextNode();
    console.log(next);
    if (next !== host) {
      const nextNeighborResponse = await httpReq.post(`${next}check`, {
        host,
        network
      });
    }
    poller = setInterval(pollRun, 1000);
  } catch (error) {
    console.log('error', next);
    await network.removeNode(next);
    poller = setInterval(pollRun, 1000);
  }
};

let poller = setInterval(pollRun, 1000);

server.post('/check', async (req, res) => {
  try {
    console.log('Check request', req.body);
    const origin = req.body.host;
    const originNet = req.body.network;
    network.mergeNetwork(originNet);
    res.json({ host, network });
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
server.listen(port, err => {
  if (err) return console.log(err);
  console.log('Server running on port', port);

  console.log('*** Host:', host);
});
