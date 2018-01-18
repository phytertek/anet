const httpReq = require('axios');
const bodyParser = require('body-parser');
const server = require('express')();
server.use(bodyParser.json());

const origin = 'https://ane1.herokuapp.com/'; // 'http://0.0.0.0'
const hostName = process.argv[3] || process.env.HOST; // 'http://0.0.0.0';
const port = process.argv[2] || process.env.PORT; // 3000;
const host = `${hostName}`;

const network = require('./network');
network.init(origin, host);
// let network = [...new Set([origin, host])];
// const removeNode = node => {
//   const newNet = new Set(network);
//   newNet.delete(node);
//   network = [...newNet];
// };
// const nextNode = () => {
//   network = [...network];
//   const next = network.shift();
//   network.push(next);
//   network = [...new Set(network)];
//   return next;
// };
const networkRemoveNode = async n => {
  try {
    network.removeNode(n);
    network.copy().forEach(node => {
      try {
        httpReq.post(`${node}remove-node`, { node: n });
      } catch (error) {
        throw new Error(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
// const mergeNetwork = n => {
//   network = [...new Set([...network, ...n])];
// };
// const newNet = n => {
//   network = [...new Set([...n, host])];
// };

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
    if (next !== host) {
      const neighborResponse = await httpReq.post(`${next}check`, {
        host,
        network: network.copy()
      });
    }
    poller = setInterval(pollRun, 1000);
  } catch (error) {
    console.log('error', next);
    await networkRemoveNode(next);
    poller = setInterval(pollRun, 1000);
  }
};

let poller = setInterval(pollRun, 1000);

server.post('/check', async (req, res) => {
  try {
    console.log(network.copy());
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
server.listen(port, err => {
  if (err) return console.log(err);
  console.log('*** Host:', host);
  console.log('Server running on port', port);
});
