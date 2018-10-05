const BinaryExpressionAstItem = require('./BinaryExpressionAstItem');

const LogicalANDOperator = '&&';
class LogicalANDExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) && this.right.run(scope);
  }

  // LogicalANDExpression	::=	BitwiseORExpression ( LogicalANDOperator BitwiseORExpression )*
  static read(ctx) {
    ctx.dlog('readLogicalANDExpression');
    let child = require('../old/parser').readBitwiseORExpression(ctx);
    while (ctx.itr.peek.v === LogicalANDOperator) {
      ctx.itr.read(LogicalANDOperator);
      child = new LogicalANDExpression(
        child,
        require('../old/parser').readBitwiseORExpression(ctx)
      );
    }
    return child;
  }
}

const LogicalOROperator = '||';
class LogicalORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) || this.right.run(scope);
  }

  // LogicalORExpression	::=	LogicalANDExpression ( LogicalOROperator LogicalANDExpression )*
  static read(ctx) {
    ctx.dlog('readLogicalORExpression');
    let child = LogicalANDExpression.read(ctx);
    while (ctx.itr.peek.v === LogicalOROperator) {
      ctx.itr.read(LogicalOROperator);
      child = new LogicalORExpression(child, LogicalANDExpression.read(ctx));
    }
    return child;
  }
}

module.exports = {
  LogicalANDOperator,
  LogicalANDExpression,
  LogicalOROperator,
  LogicalORExpression
};
