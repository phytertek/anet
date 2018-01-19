const hash = require('object-hash');

class Ledger {
  constructor() {
    this.chain = [];
    this.transactions = [];
    this.newBlock(1, 100);
  }
  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }
  newTransaction(sender, recipient, amount) {
    console.log('new transaction');
    const transaction = {
      sender,
      recipient,
      amount
    };
    this.transactions.push(transaction);
    console.log(this.transactions);
    return this.lastBlock.index + 1;
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
    let proof = 0;
    while (!this.validProof(last_proof, proof)) {
      proof++;
    }
    return proof;
  }

  validProof(last_proof, proof) {
    const guess = `${last_proof}${proof}`;
    const guess_hash = this.hash(guess);
    return guess_hash.slice(0, 4) === '0000';
  }

  validChain(chain) {
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

  resolveConflict(neighbor_chain) {
    let max_length = this.chain.length;
    if (neighbor_chain.length > max_length && this.validChain(neighbor_chain)) {
      this.chain = neighbor_chain;
    }
  }
}

const ledger = new Ledger();

const actions = {
  getChain: () => ledger.chain,
  getTransactions: () => ledger.transactions,
  newTransaction: (sender, recipient, amount) => {
    const transaction = ledger.newTransaction(sender, recipient, amount);
    mine();
    return transaction;
  },
  resolveConflict: neighbor_chain => ledger.resolveConflict(neighbor_chain),
  mine: async () => {
    try {
      const last_block = ledger.lastBlock;
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
  }
};

module.exports = actions;
