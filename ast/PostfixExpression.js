const StorageSlot = require('./helpers/StorageSlot');

const AstItem = require('./AstItem');
const LeftHandSideExpression = require('./LeftHandSideExpression');

const PostfixOperator = {
  '++': x => x + 1,
  '--': x => x - 1
};

class PostfixExpression extends AstItem {
  constructor(leftHandSizeExpression, postfixOperator) {
    super(leftHandSizeExpression);
    this.mustBe(() => leftHandSizeExpression, LeftHandSideExpression);

    this.leftHandSizeExpression = leftHandSizeExpression;
    this.postfixOperator = PostfixOperator[postfixOperator];
  }

  run(scope) {
    const so = this.leftHandSizeExpression.run(scope);
    const initialValue = so.valueOf();
    const value = this.postfixOperator(initialValue);
    so.set(value);
    return new StorageSlot(initialValue);
  }
}

PostfixExpression.PostfixOperator = PostfixOperator;

module.exports = PostfixExpression;
