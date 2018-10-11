const AstItem = require('./AstItem.js');

module.exports = class ContinueStatement extends AstItem {
  constructor() {
    super();
  }

  run(scope) {
    scope.setContinue();
  }

  // ContinueStatement	::=	"continue" ( Identifier )? ( ";" )?
  static read(ctx) {
    ctx.dlog('readContinue');
    ctx.itr.read('continue');

    let identifier = null;
    if (ctx.itr.peek.t === 'identifier') {
      throw new NotImplementedError('readContinue named continue');
      identifier = Identifier(ctx);
    }

    ctx.skipSemi(ctx);
    return new ContinueStatement(identifier);
  }
};
