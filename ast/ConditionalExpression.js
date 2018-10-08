const AstItem = require('./AstItem');

module.exports = class ConditionalExpression extends AstItem {
  constructor(condition, trueExpression, falseExpression) {
    super(condition, trueExpression, falseExpression);
    this.condition = condition;
    this.trueExpression = trueExpression;
    this.falseExpression = falseExpression;
  }

  run(scope) {
    const conditionValue = this.condition.run(scope).valueOf();
    if (conditionValue) {
      return this.trueExpression.run(scope);
    } else if (this.elseStatement) {
      return this.falseExpression.run(scope);
    }
  }

  // ConditionalExpression	::=	LogicalORExpression ( "?" AssignmentExpression ":" AssignmentExpression )?
  static read(ctx) {
    ctx.dlog('readConditionalExpression');
    const condition = LogicalORExpression.read(ctx);
    if (ctx.itr.peek.v === '?') {
      ctx.itr.read('?');
      const trueExpression = AssignmentExpression.read(ctx);
      ctx.itr.read(':');
      const falseExpression = AssignmentExpression.read(ctx);

      return new ConditionalExpression(
        condition,
        trueExpression,
        falseExpression
      );
    }
    return condition;
  }
};

const { LogicalORExpression } = require('./logical');
const AssignmentExpression = require('./AssignmentExpression');
