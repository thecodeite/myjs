const AstItem = require('./AstItem');

module.exports = class Expression extends AstItem {
  constructor(assignmentExpressions) {
    super(...assignmentExpressions);
  }

  run(scope) {
    return this.runChildren(scope);
  }

  // Expression	::=	AssignmentExpression ( "," AssignmentExpression )*
  static read(ctx) {
    ctx.dlog('readExpression');
    ctx.noIn.push(false);
    return Expression.readCommon(ctx);
  }

  static readNoIn(ctx) {
    ctx.dlog('readExpressionNoIn');
    ctx.noIn.push(true);
    return Expression.readCommon(ctx);
  }

  static readCommon(ctx) {
    const assignmentExpressions = [AssignmentExpression.read(ctx)];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      assignmentExpressions.push(AssignmentExpression.read(ctx));
    }
    ctx.noIn.pop();
    if (assignmentExpressions.length === 1) {
      return assignmentExpressions[0];
    } else {
      return new Expression(assignmentExpressions);
    }
  }
};

const AssignmentExpression = require('./AssignmentExpression');
