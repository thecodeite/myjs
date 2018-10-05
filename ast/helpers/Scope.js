const createGlobal = require('../../global');

class Scope {
  constructor(parentScope) {
    if (parentScope === undefined) {
      throw new Error('Must give parent scope');
    }
    this.__parentScope = parentScope;
    this.global = parentScope.global;
  }
}

class RootScope extends Scope {
  constructor(options) {
    const global = createGlobal(options);
    super(global);
    this.global = global;
  }
}

module.exports = {
  Scope,
  RootScope
};
