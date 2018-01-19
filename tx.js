const axios = require('axios');
const network = require('./network');
const { host, origin } = require('./identity');

const broadcastRemoveNode = async node => {
  network.copy().forEach(n => {
    try {
      if (n !== host && n !== origin) {
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
    try {
      if (next !== host) {
        const res = await axios.post(`${next}check`, {
          host,
          network: network.copy()
        });
        return res;
      }
    } catch (error) {
      network.removeNode(next);
      broadcastRemoveNode(next);
    }
  }
};

module.exports = actions;
