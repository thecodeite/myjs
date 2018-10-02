const BinaryExpressionOperatorsAstItem = require('./BinaryExpressionOperatorsAstItem');

const RelationalOperator = {
  '<': (left, right) => left < right,
  '>': (left, right) => left > right,
  '<=': (left, right) => left <= right,
  '>=': (left, right) => left >= right,
  instanceof: (left, right) => left instanceof right,
  in: (left, right) => {
    if (typeof right !== 'object') {
      throw new Error(
        `TypeError: Cannot use 'in' operator to search for ${JSON.stringify(
          left
        )} in ${JSON.stringify(right)}`
      );
    }
    const rightObject = right.valueOf();
    return left in rightObject;
  }
};

class RelationalExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, RelationalOperator);
  }

  run(scope) {
    return super.run(scope);
  }
}

RelationalExpression.RelationalOperator = RelationalOperator;
module.exports = RelationalExpression;
