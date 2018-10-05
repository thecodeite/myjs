const BinaryExpressionAstItem = require('./BinaryExpressionAstItem');

const BitwiseANDOperator = '&';
class BitwiseANDExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) & this.right.run(scope);
  }

  // BitwiseXORExpression	::=	BitwiseANDExpression ( BitwiseXOROperator BitwiseANDExpression )*
  static read(ctx) {
    ctx.dlog('readBitwiseXORExpression');
    let child = BitwiseANDExpression.read(ctx);
    while (ctx.itr.peek.v === BitwiseXOROperator) {
      ctx.itr.read(BitwiseXOROperator);
      child = new BitwiseXORExpression(child, BitwiseANDExpression.read(ctx));
    }
    return child;
  }
}

const BitwiseXOROperator = '^';
class BitwiseXORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) ^ this.right.run(scope);
  }

  // BitwiseANDExpression	::=	EqualityExpression ( BitwiseANDOperator EqualityExpression )*
  static read(ctx) {
    ctx.dlog('readBitwiseANDExpression');
    let child = require('../old/parser').readEqualityExpression(ctx);
    while (ctx.itr.peek.v === BitwiseANDOperator) {
      ctx.itr.read(BitwiseANDOperator);
      child = new BitwiseANDExpression(
        child,
        require('../old/parser').readEqualityExpression(ctx)
      );
    }
    return child;
  }
}

const BitwiseOROperator = '|';
class BitwiseORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) | this.right.run(scope);
  }

  // BitwiseORExpression	::=	BitwiseXORExpression ( BitwiseOROperator BitwiseXORExpression )*
  static read(ctx) {
    ctx.dlog('readBitwiseORExpression');
    let child = BitwiseXORExpression.read(ctx);
    while (ctx.itr.peek.v === BitwiseOROperator) {
      ctx.itr.read(BitwiseOROperator);
      child = new BitwiseORExpression(child, BitwiseXORExpression.read(ctx));
    }
    return child;
  }
}

module.exports = {
  BitwiseANDOperator,
  BitwiseANDExpression,
  BitwiseXOROperator,
  BitwiseXORExpression,
  BitwiseOROperator,
  BitwiseORExpression
};
