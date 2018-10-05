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

  // Identifier	::=	<IDENTIFIER_NAME>
  static read(ctx) {
    ctx.dlog('readIdentifier');
    const { value } = ctx.itr.next();
    if (value.t !== 'identifier')
      throw new Error(
        'readIdentifier Expected identifier, got:' + JSON.stringify(value)
      );
    return new Identifier(value.v);
  }
};
