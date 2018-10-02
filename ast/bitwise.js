const BinaryExpressionAstItem = require('./BinaryExpressionAstItem');

const BitwiseANDOperator = '&';
class BitwiseANDExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) & this.right.run(scope);
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
}

const BitwiseOROperator = '|';
class BitwiseORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) | this.right.run(scope);
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
