const tx = require('./tx');
const interval = process.env.INTERVAL || 500;
let poller;

const pollRun = async () => {
  try {
    clearInterval(poller);
    await pollNetwork();
  } catch (error) {
    console.log(error);
  }
};

const pollNetwork = async () => {
  try {
    const res = await tx.pollNetwork();
    poller = setInterval(pollRun, interval);
    return res;
  } catch (error) {
    console.log(error);
    poller = setInterval(pollRun, interval);
  }
};

poller = setInterval(pollRun, interval);
