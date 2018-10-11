class StorageSlot {
  constructor(initialData, ref, key) {
    this.data = initialData;
    this.ref = ref;
    this.key = key;
  }

  getChild(key) {
    if (!Object.prototype.hasOwnProperty.call(this.data, key)) {
      // Should check hirachy here.
      return new StorageSlot(undefined, this, key);
    }

    if (key === 'length' && Array.isArray(this.data)) {
      return new StorageSlot(this.data.length);
    }

    const so = this.data[key];
    so.ref = this;
    so.key = key;
    return so;
  }

  set(value) {
    this.data = value;

    if (
      this.ref &&
      this.ref instanceof StorageSlot &&
      this.ref.data &&
      this.ref.data[this.key] !== this
    ) {
      this.ref.data[this.key] = this;
    }
  }

  toString() {
    return `«(${typeof this.data}) data:${this.data}»`;
  }

  toJSON(key) {
    if (typeof this.data === 'object' && this.data !== null) {
      return this.data;
    }
    return `«(${typeof this.data}) data:${this.data}»`;
  }

  valueOf() {
    return this.data;
  }

  typeOf() {
    return typeof this.data;
  }

  delete() {
    if (this.ref && this.key) {
      this.ref.data[this.key] = undefined;
      return new StorageSlot(true);
    } else {
      return new StorageSlot(false);
    }
  }
}

class ScopeStorageSlot extends StorageSlot {
  constructor(scope) {
    super(scope);
  }
}
class FunctionStorageSlot extends StorageSlot {
  constructor(func) {
    super({});
    // if (!(func instanceof Function)) {
    //   throw new Error('FunctionStorageSlot expecting a function, got:' + func);
    // }
    this.func = func;

    this.__callable = func.runBody.bind(func);
    this.__params = func.params;

    this.data.call = {
      __callable: func.runBody.bind(func),
      __params: { children: [{ name: 'this' }, ...func.params.children] }
    };
    this.data.apply = {
      __callable: scope => {
        if (
          func.params &&
          func.params.children &&
          scope.inCurrentScope('__applyArgValues')
        ) {
          const argValues = scope.getValue('__applyArgValues');
          for (let i = 0; i < func.params.children.length; i++) {
            const identifier = func.params.children[i];
            const value = argValues && argValues[i];
            if (value !== undefined) {
              scope.addSlot(identifier.name, value);
            } else {
              scope.addValue(identifier.name, undefined);
            }
          }
        }
        return func.runBody(scope);
      },
      __params: { children: [{ name: 'this' }, { name: '__applyArgValues' }] }
    };
  }

  toString() {
    return `«(function)»`;
  }

  toJSON(key) {
    // if (typeof this.data === 'object' && this.data !== null) {
    //   return this.data;
    // }
    return `«(function)»`;
  }

  typeOf() {
    return 'function';
  }
}

module.exports = StorageSlot;
module.exports.ScopeStorageSlot = ScopeStorageSlot;
module.exports.FunctionStorageSlot = FunctionStorageSlot;

const { Function } = require('../Function');
