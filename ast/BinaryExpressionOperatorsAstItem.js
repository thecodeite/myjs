const StorageSlot = require('./helpers/StorageSlot');
const BinaryExpressionAstItem = require('./BinaryExpressionAstItem');

module.exports = class BinaryExpressionOperatorsAstItem extends BinaryExpressionAstItem {
  constructor(left, right, operator, validOperators) {
    super(left, right);
    if (!left) throw new Error('left missing');
    if (!right) throw new Error('right missing');
    this.left = left;
    this.right = right;
    this.operator = operator;
    this.validOperators = validOperators;

    if (!validOperators[operator]) {
      throw new Error(
        'Can not create BinaryExpressionAstItem with operator ' + operator
      );
    }
  }

  toString(pad = '') {
    return `${pad}[${this.constructor.name}:${this.operator}]`;
  }

  run(scope) {
    const left = this.left.run(scope).valueOf();
    const right = this.right.run(scope).valueOf();
    const result = this.validOperators[this.operator](left, right);
    return new StorageSlot(result);
  }
};
