const AstItem = require('./AstItem');
const { FunctionExpression } = require('./function');

module.exports = class MemberExpression extends AstItem {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  run(scope) {
    return this.expression.run(scope);
  }

  // MemberExpression	::=
  // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* )
  // |	AllocationExpression
  static read(ctx) {
    ctx.dlog('readMemberExpression');
    // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* ) | AllocationExpression
    const expression = (() => {
      if (ctx.itr.peek.v === 'new') {
        return require('../old/parser').readAllocationExpression(ctx);
      }

      let child;
      if (ctx.itr.peek.v === 'function') {
        child = FunctionExpression.read(ctx);
      } else {
        child = require('../old/parser').readPrimaryExpression(ctx);
      }
      while (ctx.itr.peek.v === '[' || ctx.itr.peek.v === '.') {
        child = require('../old/parser').readMemberExpressionPart(ctx, child);
      }
      return child;
    })();
    return new MemberExpression(expression);
  }
};
