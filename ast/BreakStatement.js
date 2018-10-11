const AstItem = require('./AstItem.js');

module.exports = class BreakStatement extends AstItem {
  constructor() {
    super();
  }

  run(scope) {
    scope.setBreak();
  }

  // BreakStatement	::=	"break" ( Identifier )? ( ";" )?
  static read(ctx) {
    ctx.dlog('readBreak');
    ctx.itr.read('break');

    let identifier = null;
    if (ctx.itr.peek.t === 'identifier') {
      throw new NotImplementedError('readBreak named break');
      identifier = Identifier.read(ctx);
    }

    ctx.skipSemi(ctx);
    return new BreakStatement(identifier);
  }
};
