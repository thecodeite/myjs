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
    const variableDeclaration = require('../old/parser').readVariableDeclaration(
      ctx
    );
    if (ctx.itr.peek.v !== ',') {
      return variableDeclaration;
    }
    const variableDeclarations = [variableDeclaration];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      variableDeclarations.push(
        require('../old/parser').readVariableDeclaration(ctx)
      );
    }
    return new VariableDeclarationList(variableDeclarations);
  }
};
