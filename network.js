class Network {
  constructor(network = [], removalQueue = {}) {
    this.host = null;
    this.origin = null;
    this.network = [...new Set(network)];
    this.removalQueue = removalQueue;
  }

  get next() {
    return this.network[Math.floor(Math.random() * this.network.length)];
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
    Object.keys(this.removalQueue).forEach(node => {
      if (filtered.has(node)) {
        filtered.delete(node);
        this.incrementRecurrance(node);
      } else {
        this.decrementLifetime(node);
      }
    });
    return filtered;
  }
  has(node) {
    const network = new Set(this.network);
    return network.has(node);
  }
  add(node) {
    const network = new Set(this.network);
    network.add(node);
    this.network = [...network];
  }
  remove(node) {
    this.addToRemovalQueue(node);
    this.network = [...this.filteredByRemovalQueue(this.network)];
  }
  merge(newNetwork) {
    const network = this.filteredByRemovalQueue(newNetwork);
    this.network = [...new Set([...this.network, ...network])];
  }
  init(origin, host) {
    this.origin = origin;
    this.host = host;
    this.network = [...new Set([origin, host])];
  }
  get copy() {
    return [...this.filteredByRemovalQueue(this.network)];
  }
}

const network = new Network();

const actions = {
  has: node => network.has(node),
  getHost: () => network.host,
  getOrigin: () => network.origin,
  nextNode: () => network.next,
  removeNode: node => network.remove(node),
  addNode: node => network.add(node),
  merge: newNetwork => network.merge(newNetwork),
  init: (origin, host) => network.init(origin, host),
  copy: () => network.copy,
  getRemovalQueue: () => network.removalQueue
};

module.exports = actions;
