const AstItem = require('./AstItem.js');
const Expression = require('./Expression.js');

module.exports = class ExpressionStatement {
  constructor() {
    throw new Error();
  }

  // ExpressionStatement	::=	Expression ( ";" )?
  static read(ctx) {
    ctx.dlog('readExpressionStatement');
    const exp = Expression.read(ctx);
    ctx.skipSemi(ctx);
    return exp;
  }
};
