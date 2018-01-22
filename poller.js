const tx = require('./tx');
const interval = process.env.INTERVAL || 1500;
let poller;

const pollNetwork = () => {
  try {
    tx.pollNetwork();
  } catch (error) {
    console.log(error);
    poller = setInterval(pollNetwork, interval);
  }
};

poller = setInterval(pollNetwork, interval);
