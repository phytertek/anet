const tx = require('./tx');
const interval = process.env.INTERVAL || 1000;
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
    /** ledger reconcile here */
    poller = setInterval(pollRun, interval);
  } catch (error) {
    poller = setInterval(pollRun, interval);
  }
};

poller = setInterval(pollRun, interval);
