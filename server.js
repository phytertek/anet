const portFinder = require('portfinder');
const identity = require('./identity');
const network = require('./network');
const ledger = require('./ledger');
const tx = require('./tx');
const mine = require('./mine');
const bodyParser = require('body-parser');
const server = require('express')();
server.use(bodyParser.json());

server.get('/network', (req, res) => res.json(network.copy()));

server.post('/network/add', async (req, res) => {
  try {
    const host = req.body.host;
    if (!network.has(host)) {
      network.add(host);
      network.merge(req.body.network);
      tx.broadcastStartup(host);
    }
    res.json({ network: network.copy() });
  } catch (error) {
    res.json(error);
  }
});

server.get('/ledger', (req, res) => res.json(ledger.copy()));

server.get('/transactions', (req, res) => res.json(ledger.trasactions()));

server.post('/network/poll', async (req, res) => {
  try {
    console.log('Rec Check', req.body.host);
    const neighbor = req.body.host;
    const neighborNetwork = req.body.network;
    const neighborChain = req.body.chain;
    network.merge(neighborNetwork);
    ledger.resolve(neighborChain);
    res.json({
      host: network.host(),
      network: network.copy(),
      chain: ledger.copy()
    });
  } catch (error) {
    res.json(error);
  }
});

server.post('/network/remove', async (req, res) => {
  try {
    network.remove(req.body.node);
    res.sendStatus(200);
  } catch (error) {
    res.json(error);
  }
});

server.get('/test', (req, res) => res.json(tx.resolveTransactions()));

server.post('/transactions/recieve', async (req, res) => {
  try {
    console.log('transaction replication recieved');
    const required = ['host', 'sender', 'recipient', 'amount', 'timestamp'];
    for (let i = 0; i < required.length; i++) {
      if (!!!req.body[required[i]])
        return console.log(`${required[i]} is required in the request body`);
    }
    if (network.has(req.body.host)) {
      console.log('network has host');
      ledger.newTransaction(
        req.body.sender,
        req.body.recipient,
        req.body.amount,
        req.body.timestamp
      );
    } else {
      console.log('network no have host');
    }
    res.sendStatus(201);
  } catch (error) {
    res.json(error);
  }
});

server.get('/transactions/clear', async (req, res) => {
  try {
    ledger.clearTransactions();
    res.sendStatus(200);
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
    const { index, timestamp } = ledger.newTransaction(
      req.body.sender,
      req.body.recipient,
      req.body.amount
    );
    tx.broadcastTransaction(
      req.body.sender,
      req.body.recipient,
      req.body.amount,
      timestamp
    );
    res
      .json({
        message: `Transaction will be added to block ${index}`
      })
      .status(201);
    // await tx.resolveTransactions();
    ledger.mine();
    await tx.broadcastTransactionClear();
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
      tx.broadcastStartup();
    });
  } catch (error) {
    console.log(error);
  }
};

start();
