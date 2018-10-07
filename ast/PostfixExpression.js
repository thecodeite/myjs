const StorageSlot = require('./helpers/StorageSlot');

const AstItem = require('./AstItem');

const PostfixOperator = {
  '++': x => x + 1,
  '--': x => x - 1
};
const postfixOperators = Object.keys(PostfixOperator);

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

  // PostfixExpression	::=	LeftHandSideExpression ( PostfixOperator )?
  static read(ctx) {
    ctx.dlog('readPostfixExpression');
    let leftHandSizeExpression = LeftHandSideExpression.read(ctx);
    while (postfixOperators.includes(ctx.itr.peek.v)) {
      const postfixOperator = ctx.itr.read(postfixOperators);
      leftHandSizeExpression = new PostfixExpression(
        leftHandSizeExpression,
        postfixOperator
      );
    }
    return leftHandSizeExpression;
  }
}

PostfixExpression.PostfixOperator = PostfixOperator;

module.exports = PostfixExpression;

const LeftHandSideExpression = require('./LeftHandSideExpression');
