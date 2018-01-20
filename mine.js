const ledger = require('./ledger');
const tx = require('./tx');
const mine = async () => {
  try {
    console.log('mining');
    const last_block = ledger.lastBlock();
    const last_proof = last_block.proof;
    const proof = await ledger.proofOfWork(last_proof);
    ledger.newTransaction('0', nodeId, 1);
    const previous_hash = ledger.hash(last_block);
    const block = ledger.newTransaction(proof, previous_hash);
    return {
      message: 'New Block Forged',
      index: block.index,
      transactions: block.transactions,
      proof: block.proof,
      previous_hash: block.previous_hash
    };
  } catch (error) {
    return error;
  }
};
