const AstItem = require('./AstItem.js');

module.exports = class ReturnStatement extends AstItem {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  run(scope) {
    scope.__returnValue = this.expression.run(scope);
    return scope.__returnValue;
  }

  // ReturnStatement	::=	"return" ( Expression )? ( ";" )?
  static read(ctx) {
    ctx.dlog('readExpressionStatement');
    ctx.itr.read('return');
    let exp = undefined;
    if (ctx.itr.peek.v !== ';') {
      exp = require('../old/parser').readExpression(ctx);
    }
    ctx.skipSemi(ctx);
    return new ReturnStatement(exp);
  }
};
