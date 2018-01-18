const httpReq = require('axios');
const bodyParser = require('body-parser');
const server = require('express')();
server.use(bodyParser.json());

const origin = 'https://ane1.herokuapp.com/'; // 'http://0.0.0.0'
const hostName = process.argv[3] || process.env.HOST; // 'http://0.0.0.0';
const port = process.argv[2] || process.env.PORT; // 3000;
const host = `${hostName}`;

let network = [...new Set([origin, host])];
const removeNode = (node) => {
  const newNet = new Set(network);
  newNet.delete(n);
  network = [...newNet];
}
const nextNode = () => {
  network = [...network];
  const next = network.shift();
  network.push(next);
  network = [...new Set(network)];
  return next;
};
const networkRemoveNode = async n => {
  try {
    removeNode(n)
    network.forEach(node => {
      await axios.post(`${net}remove-node`, { node: n })
    })
  } catch (error) {
    console.log(error)
  }
};
const mergeNetwork = n => {
  network = [...new Set([...network, ...n])];
};
const newNet = n => {
  network = [...new Set([...n, host])];
};

const pollRun = async () => {
  try {
    clearInterval(poller);
    await checkNeighbor();
  } catch (error) {
    console.log(error)
  }
};

let next;

const checkNeighbor = async () => {
  try {
    next = nextNode();
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
    await networkRemoveNode(next);
    poller = setInterval(pollRun, 1000);
  }
};

let poller = setInterval(pollRun, 1000);

server.post('/check', async (req, res) => {
  try {
    console.log('Check request', req.body);
    const origin = req.body.host;
    const originNet = req.body.network;
    newNet(originNet);
    res.json({ host, network });
  } catch (error) {
    res.json(error);
  }
});

server.post('/remove-node', async)
server.listen(port, err => {
  if (err) return console.log(err);
  console.log('Server running on port', port);

  console.log('*** Host:', host);
});
