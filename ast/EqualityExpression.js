const BinaryExpressionOperatorsAstItem = require('./BinaryExpressionOperatorsAstItem');

const EqualityOperator = {
  '==': (left, right) => left == right,
  '!=': (left, right) => left != right,
  '===': (left, right) => left === right,
  '!==': (left, right) => left !== right
};

class EqualityExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, EqualityOperator);
  }
}

EqualityExpression.EqualityOperator = EqualityOperator;
module.exports = EqualityExpression;
