const AstItem = require('./AstItem');

module.exports = class Identifier extends AstItem {
  constructor(name) {
    super();
    if (typeof name !== 'string') {
      throw new Error('name must be string');
    }
    this.name = name;
  }

  toString(pad = '') {
    return `${pad}[Identifier:'${this.name}']`;
  }

  run(scope) {
    let currentScope = scope;

    let id = this.name;
    while (currentScope) {
      if (id in currentScope) {
        return currentScope[id];
      }
      currentScope = currentScope.__parentScope;
    }

    throw new Error(id + ' is not defined');
  }
};
