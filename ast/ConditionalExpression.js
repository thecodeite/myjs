const AstItem = require('./AstItem');

const { LogicalORExpression } = require('./logical');

module.exports = class ConditionalExpression extends AstItem {
  constructor(...children) {
    super(...children);
  }

  // ConditionalExpression	::=	LogicalORExpression ( "?" AssignmentExpression ":" AssignmentExpression )?
  static read(ctx) {
    ctx.dlog('readConditionalExpression');
    const left = LogicalORExpression.read(ctx);
    if (ctx.itr.peek.v === '?')
      throw new Error('Not implemented: readConditionalExpression');
    return left;
  }
};
