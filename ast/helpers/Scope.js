module.exports = class Scope {
  constructor(parentScope) {
    this.__parentScope = parentScope;
  }
};
