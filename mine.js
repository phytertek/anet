const ledger = require('./ledger');
const tx = require('./tx');

const mine = async () => {
  try {
    console.log('mining');
    const last_block = ledger.lastBlock();
    const last_proof = last_block.proof;
    const proof = await ledger.proofOfWork(last_proof);
    const transactionsResolved = await tx.resolveTransactions();
    if (transactionsResolved) {
      console.log('Miner - Transactions resolved', transactionsResolved);
      ledger.newTransaction('0', nodeId, 1);
      const previous_hash = ledger.hash(last_block);
      const block = ledger.newBlock(proof, previous_hash);
      console.log('I made it this far');
      const broadcastComplete = await tx.broadcastMinedBlock();
      if (broadcastComplete) {
        console.log('Newly mined block broadcasted');
      } else {
        console.log('block broadcast failed');
      }
    }
  } catch (error) {
    return error;
  }
};

module.exports = mine;
