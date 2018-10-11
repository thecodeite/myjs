const createGlobal = require('../../global');
const StorageSlot = require('./StorageSlot');
const { ScopeStorageSlot } = StorageSlot;

let off = false;
let allow = off;
const whiteList = [
  'inCurrentScope',
  'getSlot',
  'getValue',
  'addSlot',
  'addValue',
  'createChild',
  'setReturnValue',
  'getReturnValue',
  'bubbleReturn',
  'getError',
  'setError',
  'bubbleError',
  'clearError',
  'getBreak',
  'setBreak',
  'clearBreak',
  'getContinue',
  'setContinue',
  'clearContinue',
  'getGlobal'
];
const handler = {
  get: (obj, prop) => {
    // if (prop !== 'getSlot') {
    //   console.trace('RootScope.get', prop);
    // }
    if (!allow) {
      if (!whiteList.includes(prop)) {
        throw new Error('Do not read directly:' + prop);
      }
    }
    return obj[prop];
  },
  set: (obj, prop, value) => {
    if (!allow) {
      throw new Error('Do not create directly');
    }
    obj[prop] = value;
    return true;
  }
};

class Scope {
  constructor(parentScope) {
    if (parentScope === undefined) {
      throw new Error('Must give parent scope');
    }
    this.__parentScope = parentScope;
  }

  inCurrentScope(id) {
    allow = true;
    try {
      return id in this;
    } finally {
      allow = false;
    }
  }

  getSlot(id) {
    allow = true;
    try {
      let currentScope = this;
      while (currentScope) {
        if (id in currentScope) {
          return currentScope[id];
        }
        currentScope = currentScope.__parentScope;
      }

      return undefined;
    } finally {
      allow = false;
    }
  }

  getValue(id) {
    const slot = this.getSlot(id);
    return slot.valueOf();
  }

  addSlot(id, slot) {
    allow = true;
    this[id] = slot;
    allow = false;
    return slot;
  }

  addValue(id, value) {
    allow = true;
    const slot = (this[id] = new StorageSlot(value, this, id));
    allow = false;
    return slot;
  }

  createChild() {
    const newScope = new Scope(this);
    return new Proxy(newScope, handler);
  }

  setReturnValue(slot) {
    allow = true;
    this.__returnValue = slot;
    allow = false;
  }

  getReturnValue() {
    allow = true;
    try {
      return this.__returnValue;
    } finally {
      allow = false;
    }
  }

  bubbleReturn() {
    allow = true;
    this.__parentScope.__returnValue = this.__returnValue;
    allow = false;
  }

  getError() {
    allow = true;
    try {
      return this.__error;
    } finally {
      allow = false;
    }
  }

  setError(slot) {
    allow = true;
    this.__error = slot;
    allow = false;
  }

  bubbleError() {
    if ('__error' in this) {
      allow = true;
      this.__parentScope.__error = this.__error;
      allow = false;
    }
  }

  clearError() {
    allow = true;
    delete this.__error;
    allow = false;
  }

  setBreak() {
    allow = true;
    this.__break = true;
    allow = false;
  }

  clearBreak() {
    allow = true;
    delete this.__break;
    allow = false;
  }

  getBreak() {
    allow = true;
    try {
      return this.__break;
    } finally {
      allow = false;
    }
  }

  setContinue() {
    allow = true;
    this.__continue = true;
    allow = false;
  }

  getContinue() {
    allow = true;
    try {
      return this.__continue;
    } finally {
      allow = false;
    }
  }

  clearContinue() {
    allow = true;
    delete this.__continue;
    allow = false;
  }
}

class RootScope extends Scope {
  constructor(options) {
    const __rawGlobal = createGlobal(options || {});
    super(__rawGlobal);
    for (let prop in __rawGlobal) {
      this[prop] = __rawGlobal[prop];
    }

    this.global = new ScopeStorageSlot(this);
    this.__rawGlobal = __rawGlobal;
  }

  clean() {
    for (let prop in this) {
      if (this[prop] === this.__rawGlobal[prop]) {
        delete this[prop];
      }
    }

    delete this.__rawGlobal;
    delete this.__parentScope;
    delete this.global;
  }
}

function createRootScope(options) {
  const rootScope = new RootScope(options);

  return new Proxy(rootScope, handler);
}

function unlockScope() {
  off = true;
  allow = true;
}
module.exports = {
  createRootScope,
  unlockScope
};
