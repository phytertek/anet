const tx = require('./tx');
const interval = process.env.INTERVAL || 0;
let poller;

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
    const res = await tx.checkNeighbor();
    poller = setInterval(pollRun, interval);
  } catch (error) {
    poller = setInterval(pollRun, interval);
  }
};

poller = setInterval(pollRun, interval);
