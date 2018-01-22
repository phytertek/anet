const ledger = require('./ledger');

const resolver = neighbor_chain => {
  let chain_updated = false;
  const this_chain = ledger.copy();
  const this_trasactions = ledger.transactions();

  // Is neighbor_chain > this_chain?
  if (neighbor_chain.length > this_chain) {
    const this_chain_hash = ledger.hash(this_chain);
    const neighbor_chain_hash = ledger.hash(
      neighbor_chain.slice(0, this_chain.length)
    );
    // Does the neighbor chain match without the additional blocks, or is this_chain new?
    if (this_chain_hash === neighbor_chain_hash || this_chain.length === 1) {
      // Is the neighbor chain valid?
      if (ledger.validChain(neighbor_chain)) {
        // Set this chain to the neighbor chain
        ledger.setChain(neighbor_chain);
        chain_updated = true;
        // Get and hash all transactions in the new blocks
        const verified_transactions_hashes = neighbor_chain
          .slice(this_chain.length, neighbor_chain.length)
          .reduce((txs, block) => {
            txs.push(block.transactions.map(t => ledger.hash(t)));
          }, []);
        // filter out the verified transactions from this_transactions
        const filtered_transactions = this_trasactions.filter(t => {
          return !verified_transactions_hashes.includes(ledger.hash(t));
        });
        // set this transactions to filtered transactions
        ledger.setTransactions(filtered_transactions);
      }
    }
  }
};

module.exports = resolver;
