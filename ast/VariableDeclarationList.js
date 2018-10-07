const AstItem = require('./AstItem');

module.exports = class VariableDeclarationList extends AstItem {
  constructor(variableDeclarations) {
    super(...variableDeclarations);
    this.variableDeclarations = variableDeclarations;
  }

  run(scope) {
    for (var variableDeclaration of this.variableDeclarations) {
      variableDeclaration.run(scope);
    }
  }

  // VariableDeclarationList	::=	VariableDeclaration ( "," VariableDeclaration )*
  static read(ctx) {
    ctx.dlog('readVariableDeclarationList');
    const variableDeclaration = VariableDeclaration.read(ctx);
    if (ctx.itr.peek.v !== ',') {
      return variableDeclaration;
    }
    const variableDeclarations = [variableDeclaration];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      variableDeclarations.push(VariableDeclaration.read(ctx));
    }
    return new VariableDeclarationList(variableDeclarations);
  }
};

const VariableDeclaration = require('./VariableDeclaration');
