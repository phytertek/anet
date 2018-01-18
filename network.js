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
      lifeTime: 10
    };
  }
  decrementLifetime(node) {
    this.removalQueue[node].lifeTime--;
  }
  filteredByRemovalQueue(network) {
    const filtered = new Set(network);
    Object.keys(this.removalQueue).forEach(node => {
      if (filtered.has(node)) {
        filtered.delete(node);
      } else {
        if (this.removalQueue[node].lifeTime <= 0) {
          delete this.removalQueue[node];
        } else {
          decrementLifetime(node);
        }
      }
    });
    return filtered;
  }
  remove(node) {
    const network = new Set(this.network);
    network.delete(node);
    this.network = [...network];
    this.addToRemovalQueue(node);
  }
  mergeNetwork(newNetwork) {
    const network = filteredByRemovalQueue(newNetwork);
    this.network = [...new Set([...this.network, ...network])];
  }
  init(origin, host) {
    this.network = [...new Set([origin, host])];
  }
  get copy() {
    return [...this.network];
  }
}

const network = new Network();

const actions = {
  nextNode: () => network.next,
  removeNode: node => network.remove(node),
  mergeNetwork: newNetwork => network.mergeNetwork(newNetwork),
  init: (origin, host) => network.init(origin, host),
  copy: () => network.copy
};

module.exports = actions;
