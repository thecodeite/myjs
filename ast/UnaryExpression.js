const StorageSlot = require('./helpers/StorageSlot');
const AstItem = require('./AstItem');

const UnaryOperator = {
  delete: () => {
    throw new NotImplementedError('UnaryOperator: delete');
  },
  typeof: old => old.typeOf(),
  void: () => undefined,
  '++': old => old.valueOf() + 1,
  '--': old => old.valueOf() - 1,
  '+': old => +old.valueOf(),
  '-': old => -old.valueOf(),
  '~': old => ~old.valueOf(),
  '!': old => !old.valueOf()
};
const unaryOperators = Object.keys(UnaryOperator);

const MutatingUnaryOperators = ['++', '--'];
class UnaryExpression extends AstItem {
  constructor(unaryOperator, unaryExpression) {
    super(unaryExpression);

    this.unaryOperator = unaryOperator;
    this.unaryOperatorF = UnaryOperator[unaryOperator];
    this.unaryExpression = unaryExpression;
  }

  run(scope) {
    const so = this.unaryExpression.run(scope);

    if (this.unaryOperator === 'delete') {
      return so.delete();
    }

    const newVal = this.unaryOperatorF(so);
    if (MutatingUnaryOperators.includes(this.unaryOperator)) {
      so.set(newVal);
      return so;
    } else {
      return new StorageSlot(newVal);
    }
  }

  // UnaryExpression	::=	( PostfixExpression | ( UnaryOperator UnaryExpression )+ )
  static read(ctx) {
    ctx.dlog('readUnaryExpression');

    if (unaryOperators.includes(ctx.itr.peek.v)) {
      const unaryOperator = ctx.itr.read(unaryOperators);
      const unaryExpression = require('../old/parser').readUnaryExpression(ctx);
      return new UnaryExpression(unaryOperator, unaryExpression);
    }
    return require('../old/parser').readPostfixExpression(ctx);
  }
}

UnaryExpression.UnaryOperator = UnaryOperator;
module.exports = UnaryExpression;
