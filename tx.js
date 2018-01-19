const axios = require('axios');
const network = require('./network');
const ledger = require('./ledger');
const broadcastRemoveNode = async node => {
  network.copy().forEach(n => {
    try {
      if (n !== network.getHost() && n !== network.getOrigin()) {
        axios.post(`${n}remove-node`, { node });
      }
    } catch (error) {
      console.log('TX Broadcast Remove Node Error', error);
    }
  });
};

const actions = {
  checkNeighbor: async () => {
    const next = network.nextNode();
    console.log('Send Check', next);
    try {
      if (next !== network.getHost()) {
        const res = await axios.post(`${next}check`, {
          host: network.getHost(),
          network: network.copy(),
          chain: ledger.getChain()
        });
        const neighbor = res.data.host;
        const neighborNetwork = res.data.network;
        const neighborChain = res.data.chain;
        network.merge(neighborNetwork);
        ledger.resolveConflict(neighborChain);

        return res;
      }
    } catch (error) {
      network.removeNode(next);
      broadcastRemoveNode(next);
    }
  },
  resolveConflicts: async () => {
    const network = network.copy();
    network.forEach(async node => {
      const neighbor_chain = await axios(`${node}chain`);
      ledger.resolveConflict(neighbor_chain.data);
    });
  }
};

module.exports = actions;
