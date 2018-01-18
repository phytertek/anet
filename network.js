class Network {
  constructor(network = [], removalQueue = {}) {
    this.network = [...new Set(network)];
    this.removalQueue = removalQueue;
  }
  get next() {
    const node = this.network.shift();
    this.network.push(node);
    return node;
  }
  addToRemovalQueue(node) {
    if (this.removalQueue[node]) return;
    this.removalQueue[node] = {
      lifeTime: 10,
      recurrance: 0
    };
  }
  decrementLifetime(node) {
    this.removalQueue[node].lifeTime--;
    if (this.removalQueue[node].lifeTime <= 0) {
      delete this.removalQueue[node];
    }
  }
  incrementRecurrance(node) {
    this.removalQueue[node].recurrance++;
    if (this.removalQueue[node].recurrance >= 20) {
      delete this.removalQueue[node];
    }
  }
  filteredByRemovalQueue(network) {
    const filtered = new Set(network);
    filtered;
    Object.keys(this.removalQueue).forEach(node => {
      if (filtered.has(node)) {
        filtered.delete(node);
        this.incrementRecurrance(node);
      } else {
        this.decrementLifetime(node);
      }
    });
    filtered;
    return filtered;
  }
  add(node) {
    const network = new Set(this.network);
    network.add(node);
    this.network = [...network];
  }
  remove(node) {
    const network = new Set(this.network);
    network.delete(node);
    this.network = [...network];
    this.addToRemovalQueue(node);
  }
  merge(newNetwork) {
    const network = this.filteredByRemovalQueue(newNetwork);
    this.network = [...new Set([...this.network, ...network])];
  }
  init(origin, host) {
    this.network = [...new Set([origin, host])];
  }
  get copy() {
    return [...this.filteredByRemovalQueue(this.network)];
  }
}

const network = new Network();

const actions = {
  nextNode: () => network.next,
  removeNode: node => network.remove(node),
  addNode: node => network.add(node),
  merge: newNetwork => network.merge(newNetwork),
  init: (origin, host) => network.init(origin, host),
  copy: () => network.copy
};

module.exports = actions;
