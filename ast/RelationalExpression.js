const BinaryExpressionOperatorsAstItem = require('./BinaryExpressionOperatorsAstItem');
const { ShiftExpression } = require('./arithmetic');

const inOp = (left, right) => {
  if (typeof right !== 'object') {
    throw new Error(
      `TypeError: Cannot use 'in' operator to search for ${JSON.stringify(
        left
      )} in ${JSON.stringify(right)}`
    );
  }
  const rightObject = right.valueOf();
  return left in rightObject;
};

const RelationalOperator = {
  '<': (left, right) => left < right,
  '>': (left, right) => left > right,
  '<=': (left, right) => left <= right,
  '>=': (left, right) => left >= right,
  instanceof: (left, right) => left instanceof right,
  in: inOp
};

const relationalOperatorsWithIn = Object.keys(RelationalOperator);
const relationalOperatorsNoIn = Object.keys(RelationalOperator).filter(
  x => x !== 'in'
);

class RelationalExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, RelationalOperator);
  }

  // RelationalExpression	::=	ShiftExpression ( RelationalOperator ShiftExpression )*
  static read(ctx) {
    ctx.dlog('readRelationalExpression');
    let child = ShiftExpression.read(ctx);

    const relationalOperators = ctx.noIn[0]
      ? relationalOperatorsNoIn
      : relationalOperatorsWithIn;

    while (relationalOperators.includes(ctx.itr.peek.v)) {
      const relationalOperator = ctx.itr.read(relationalOperators);
      child = new RelationalExpression(
        child,
        ShiftExpression.read(ctx),
        relationalOperator
      );
    }
    return child;
  }
}

RelationalExpression.RelationalOperator = RelationalOperator;
module.exports = RelationalExpression;
