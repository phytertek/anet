const hash = require('object-hash');
const network = require('./network');
class Ledger {
  constructor() {
    this.chain = [];
    this.transactions = [];
    this.nodeId = this.hash(network.host());
    this.newBlock(1, 100);
  }
  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }
  newTransaction(sender, recipient, amount, timestamp) {
    console.log('getting new transaction');
    const transaction = {
      sender,
      recipient,
      amount,
      timestamp: timestamp || Date.now()
    };
    console.log('new transaction', transaction);
    this.transactions.push(transaction);
    return {
      index: this.lastBlock.index + 1,
      timestamp: transaction.timestamp
    };
  }
  newBlock(proof, previous_hash) {
    const block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.transactions,
      proof,
      previous_hash: previous_hash || this.hash(this.lastBlock)
    };
    this.transactions = [];
    this.chain.push(block);
    return block;
  }

  hash(block) {
    return hash(block, { algorithm: 'sha256', encoding: 'hex' });
  }

  async proofOfWork(last_proof) {
    try {
      let proof = 0;
      let guess = this.validProof(last_proof, proof);
      while (!guess && this.transactions.length > 0) {
        proof++;
        guess = this.validProof(last_proof, proof);
      }
      return proof;
    } catch (error) {
      console.log(error);
    }
  }

  validProof(last_proof, proof) {
    const guess = `${last_proof}${proof}`;
    const guess_hash = this.hash(guess);
    return guess_hash.slice(0, 4) === '0000';
  }

  async validChain(chain) {
    // Determine if a given blockchain is valid
    // :param chain: <list> A blockchain
    // :return: <bool> True if valid, False if not
    let last_block = chain[0];
    let current_index = 1;

    while (current_index < chain.length) {
      const block = chain[current_index];
      console.log(last_block);
      console.log(block);
      console.log('------------------');

      // Check that the hash of the block is correct
      if (block.previous_hash !== this.hash(last_block)) {
        return false;
      }

      // Check that the Proof of Work is correct
      if (!this.validProof(last_block.proof, block.proof)) {
        return false;
      }

      last_block = block;
      current_index++;
    }
    return true;
  }

  resolve(neighbor_chain) {
    let max_length = this.chain.length;
    if (neighbor_chain.length > max_length && this.validChain(neighbor_chain)) {
      this.chain = neighbor_chain;
    }
  }
}

const ledger = new Ledger();

const actions = {
  copy: () => ledger.chain,
  trasactions: () => ledger.transactions,
  newTransaction: (sender, recipient, amount, timestamp) =>
    ledger.newTransaction(sender, recipient, amount, timestamp),
  resolve: neighbor_chain => ledger.resolve(neighbor_chain),
  lastBlock: () => ledger.lastBlock,
  newBlock: (proof, previous_hash) => ledger.newBlock(proof, previous_hash),
  mine: async () => {
    try {
      console.log('mining');
      const last_block = ledger.lastBlock;
      const last_proof = last_block.proof;
      const proof = await ledger.proofOfWork(last_proof);
      ledger.newTransaction('0', ledger.nodeId, 1);
      const previous_hash = ledger.hash(last_block);
      const block = ledger.newBlock(proof, previous_hash);
      return {
        message: 'New Block Forged',
        index: block.index,
        transactions: block.transactions,
        proof: block.proof,
        previous_hash: block.previous_hash
      };
    } catch (error) {
      console.log(error);
    }
  },
  proofOfWork: async last_proof => ledger.proofOfWork(last_proof),
  hash: block => ledger.hash(block),
  setTransactions: transactions => (ledger.transactions = transactions),
  clearTransactions: () => (ledger.transactions = [])
};

module.exports = actions;
