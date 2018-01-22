class Wallet {
  constructor(address, balance, transaction_history) {
    this._address = address || '';
    this._balance = balance || 0;
    this._transaction_history = transaction_history || [];
  }
  get balance() {
    return this._balance;
  }
  set address(address) {
    this._address = address;
  }
  get address() {
    return this._address;
  }
  set transaction_history(transaction_history) {
    this._transaction_history = transaction_history;
  }
  get transaction_history() {
    return this.transaction_history;
  }
  new_transaction(transaction) {}
  rebalance() {
    let balance = 0;
    this.transaction_history.forEach(t => {});
  }
}

const test = new Wallet('ryan.phytertek@gmail.com', 0, [
  {
    block: 2,
    sender: 'ryan.phytertek@gmail.com',
    recipient: 'ryan.phytertek@gmail.com',
    amount: 1
  },
  {
    block: 3,
    sender: 'ryan.phytertek@gmail.com',
    recipient: 'ryan.phytertek@gmail.com',
    amount: 1
  },
  {
    block: 4,
    sender: 'ryan.phytertek@gmail.com',
    recipient: 'ryan.phytertek@gmail.com',
    amount: 1
  },
  {
    block: 5,
    sender: 'ryan.phytertek@gmail.com',
    recipient: 'ryan.phytertek@gmail.com',
    amount: 1
  }
]);

test;
