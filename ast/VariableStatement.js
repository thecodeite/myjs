const AstItem = require('./AstItem');

module.exports = class VariableStatement extends AstItem {
  constructor(child) {
    super(child);
  }

  run(scope) {
    return this.runChildren(scope);
  }

  // VariableStatement	::=	"var" VariableDeclarationList ( ";" )?
  static read(ctx) {
    ctx.dlog('readVariableStatement');
    ctx.itr.read('var');
    const child = VariableDeclarationList.read(ctx);
    ctx.skipSemi(ctx);
    return new VariableStatement(child);
  }
};

const VariableDeclarationList = require('./VariableDeclarationList');
