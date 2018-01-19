const portFinder = require('portfinder');
const identity = require('./identity');
const network = require('./network');
const ledger = require('./ledger');
const tx = require('./tx');
const bodyParser = require('body-parser');
const server = require('express')();
server.use(bodyParser.json());

server.get('/network', (req, res) => res.json(network.copy()));

server.get('/chain', (req, res) => res.json(ledger.getChain()));

server.get('/transactions', (req, res) => res.json(ledger.getTransactions()));

server.post('/check', async (req, res) => {
  try {
    console.log('Rec Check', req.body.host);
    const neighbor = req.body.host;
    const neighborNetwork = req.body.network;
    const neighborChain = req.body.chain;
    network.merge(neighborNetwork);
    ledger.resolveConflict(neighborChain);
    res.json({
      host: network.getHost(),
      network: network.copy(),
      chain: ledger.getChain()
    });
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

server.post('/transactions/recieve', async (req, res) => {
  try {
    console.log('transaction replication recieved');
    const required = ['host', 'sender', 'recipient', 'amount'];
    for (let i = 0; i < required.length; i++) {
      if (!!!req.body[required[i]])
        return res.json(`${required[i]} is required in the request body`);
    }
    if (network.has(req.body.host)) {
      ledger.newTransaction(
        req.body.sender,
        req.body.recipient,
        req.body.amount
      );
    }
    res.sendStatus(201);
  } catch (error) {
    res.json(error);
  }
});

server.post('/transactions/new', async (req, res) => {
  try {
    console.log('New transaction Recieved');
    // Check that the required fields are in the POST'ed data
    const required = ['sender', 'recipient', 'amount'];
    for (let i = 0; i < required.length; i++) {
      if (!!!req.body[required[i]])
        return res.json(`${required[i]} is required in the request body`);
    }
    const index = ledger.newTransaction(
      req.body.sender,
      req.body.recipient,
      req.body.amount
    );
    tx.broadcastTransaction(
      req.body.sender,
      req.body.recipient,
      req.body.amount
    );
    res
      .json({
        message: `Transaction will be added to block ${index}`
      })
      .status(201);
  } catch (error) {
    res.json(error);
  }
});

let port, host;
const start = async () => {
  try {
    port = identity.port || (await portFinder.getPortPromise());
    host =
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
