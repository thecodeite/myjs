const BinaryExpressionOperatorsAstItem = require('./BinaryExpressionOperatorsAstItem');

const EqualityOperator = {
  '==': (left, right) => left == right,
  '!=': (left, right) => left != right,
  '===': (left, right) => left === right,
  '!==': (left, right) => left !== right
};
const equalityOperators = Object.keys(EqualityOperator);

class EqualityExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, EqualityOperator);
  }

  // EqualityExpression	::=	RelationalExpression ( EqualityOperator RelationalExpression )*
  static read(ctx) {
    ctx.dlog('readEqualityExpression');
    let child = require('../old/parser').readRelationalExpression(ctx);
    while (ctx.itr.peek.v in EqualityOperator) {
      const equalityOperator = ctx.itr.read(equalityOperators);
      child = new EqualityExpression(
        child,
        require('../old/parser').readEqualityExpression(ctx),
        equalityOperator
      );
    }
    return child;
  }
}

EqualityExpression.EqualityOperator = EqualityOperator;
module.exports = EqualityExpression;
