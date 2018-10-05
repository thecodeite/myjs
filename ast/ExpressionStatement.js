const AstItem = require('./AstItem.js');

module.exports = class ExpressionStatement {
  constructor() {
    throw new Error();
  }

  // ExpressionStatement	::=	Expression ( ";" )?
  static read(ctx) {
    ctx.dlog('readExpressionStatement');
    const exp = require('../old/parser').readExpression(ctx);
    ctx.skipSemi(ctx);
    return exp;
  }
};
