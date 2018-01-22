const axios = require('axios');
const network = require('./network');
const ledger = require('./ledger');
const broadcastRemoveNode = async node => {
  try {
    network.copy().forEach(n => {
      console.log('Broadcast Remove Node');
      if (n !== network.host() && n !== network.origin())
        axios.post(`${n}network/remove`, { node });
    });
  } catch (error) {
    console.log('TX Broadcast Remove Node Error', error);
  }
};

const actions = {
  broadcastStartup: async host => {
    try {
      if (!host) host = network.host();
      console.log('Broadcast Startup');
      network.copy().forEach(async node => {
        if (node !== network.host() && node !== host) {
          const res = await axios.post(`${node}network/add`, {
            host,
            network: network.copy()
          });
          network.merge(res.data.network);
        }
      });
    } catch (error) {
      console.log('TX Broadcast Startup Error', error);
    }
  },
  broadcastTransaction: async (sender, recipient, amount, timestamp) => {
    try {
      console.log('Broadcast Transaction', timestamp);
      network.copy().forEach(async node => {
        if (node !== network.host())
          await axios.post(`${node}transactions/recieve`, {
            host: network.host(),
            chain: ledger.copy(),
            sender,
            recipient,
            amount,
            timestamp
          });
      });
    } catch (error) {
      console.log('TX Broadcast Transaction Error', error);
    }
  },
  pollNetwork: async () => {
    const next = network.next();
    try {
      console.log('Send Poll', next);
      const res = await axios.post(`${next}network/poll`, {
        host: network.host(),
        network: network.copy(),
        chain: ledger.copy(),
        transactions: ledger.transactions()
      });
      const neighbor = res.data.host;
      const neighborNetwork = res.data.network;
      const neighborChain = res.data.chain;
      const neighborTransactions = res.data.transactions;
      network.merge(neighborNetwork);
      ledger.resolve(neighborChain);
      // ledger.resolveTransactions(neighborTransactions);
      return res;
    } catch (error) {
      console.log('Node Not Responding', next);
      network.remove(next);
      broadcastRemoveNode(next);
    }
  },
  resolveTransactions: async () => {
    try {
      const sampleSize = Math.min(network.copy().length, 10);
      for (let i = 0; i < sampleSize; i++) {
        const node = network.next();
        const transactions = ledger.trasactions();
        const res = await axios.get(`${node}transactions`);
        console.log('Neighbor Transactions', res.data);
        if (transactions.length < res.data.length) {
          const hashed_transactions = transactions.map(t => ledger.hash(t));
          const hashed_node_transactions = res.data.map(t => ledger.hash(t));
          const conflicts = hashed_transactions.filter(
            t => !hashed_node_transactions.includes(t)
          );
          if (conflicts.length === 0) {
            console.log('Found more up to date transactions list');
            ledger.setTransactions(res.data);
          } else {
            console.log('Transaction Conflicts');
            throw new Error(conflicts);
          }
        }
      }
      return true;
    } catch (error) {
      console.log('TX Resolve Transactions Error', error);
      return false;
    }
  },
  broadcastTransactionClear: async () => {
    try {
      console.log('Broadcast Transaction Clear');
      network.copy().forEach(async node => {
        if (node !== network.host())
          await axios.get(`${node}transactions/clear`);
      });
      return true;
    } catch (error) {
      console.log('TX Broadcast Transaction Clear Error', error);
      return false;
    }
  },
  broadcastMinedBlock: async () => {
    try {
      console.log('Broadcast Mined Block');
      network.copy().forEach(async node => {
        if (node !== network.host())
          await axios.post(`${node}network/poll`, {
            host: network.host(),
            network: network.copy(),
            chain: ledger.copy()
          });
      });
      return true;
    } catch (error) {
      console.log('TX Broadcast Transaction Error', error);
      return false;
    }
  }
};

module.exports = actions;
