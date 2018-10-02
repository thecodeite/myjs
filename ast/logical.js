const BinaryExpressionAstItem = require('./BinaryExpressionAstItem');

const LogicalANDOperator = '&&';
class LogicalANDExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) && this.right.run(scope);
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
}

module.exports = {
  LogicalANDOperator,
  LogicalANDExpression,
  LogicalOROperator,
  LogicalORExpression
};
