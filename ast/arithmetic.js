const BinaryExpressionOperatorsAstItem = require('./BinaryExpressionOperatorsAstItem');

MultiplicativeOperator = {
  '*': (left, right) => left * right,
  '/': (left, right) => left / right,
  '%': (left, right) => left % right
};
const multiplicativeOperators = Object.keys(MultiplicativeOperator);

class MultiplicativeExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, MultiplicativeOperator);
  }

  // MultiplicativeExpression	::=	UnaryExpression ( MultiplicativeOperator UnaryExpression )*
  static read(ctx) {
    ctx.dlog('readMultiplicativeExpression');
    let child = UnaryExpression.read(ctx);
    while (multiplicativeOperators.includes(ctx.itr.peek.v)) {
      const multiplicativeOperator = ctx.itr.read(multiplicativeOperators);
      const right = UnaryExpression.read(ctx);
      child = new MultiplicativeExpression(
        child,
        right,
        multiplicativeOperator
      );
    }
    return child;
  }
}

const AdditiveOperator = {
  '+': (left, right) => left + right,
  '-': (left, right) => left - right
};
const additiveOperators = Object.keys(AdditiveOperator);

class AdditiveExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, AdditiveOperator);
  }

  // AdditiveExpression	::=	MultiplicativeExpression ( AdditiveOperator MultiplicativeExpression )*
  static read(ctx) {
    ctx.dlog('readAdditiveExpression');
    let child = MultiplicativeExpression.read(ctx);
    while (additiveOperators.includes(ctx.itr.peek.v)) {
      const additiveOperator = ctx.itr.read(additiveOperators);
      const right = MultiplicativeExpression.read(ctx);
      child = new AdditiveExpression(child, right, additiveOperator);
    }
    return child;
  }
}

const ShiftOperator = {
  '<<': (left, right) => left << right,
  '>>': (left, right) => left >> right,
  '>>>': (left, right) => left >>> right
};
const shiftOperators = Object.keys(ShiftOperator);

class ShiftExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, ShiftOperator);
  }
  // ShiftExpression	::=	AdditiveExpression ( ShiftOperator AdditiveExpression )*
  static read(ctx) {
    ctx.dlog('readShiftExpression');
    let child = AdditiveExpression.read(ctx);
    while (shiftOperators.includes(ctx.itr.peek.v)) {
      const shiftOperator = ctx.itr.read(shiftOperators);
      const right = AdditiveExpression.read(ctx);
      child = new ShiftExpression(child, right, shiftOperator);
    }
    return child;
  }
}

module.exports = {
  MultiplicativeOperator,
  MultiplicativeExpression,
  AdditiveOperator,
  AdditiveExpression,
  ShiftOperator,
  ShiftExpression
};

const UnaryExpression = require('./UnaryExpression');
