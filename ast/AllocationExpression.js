const AstItem = require('./AstItem');

module.exports = class AllocationExpression extends AstItem {
  constructor(...children) {
    super(...children);
  }

  // AllocationExpression	::=	( "new" MemberExpression ( ( Arguments ( MemberExpressionPart )* )* ) )
  static read(ctx) {
    ctx.dlog('readAllocationExpression');
    throw new NotImplementedError('readAllocationExpression');
  }
};
