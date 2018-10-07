const AstItem = require('./AstItem');

module.exports = class Expression extends AstItem {
  constructor() {
    super();
  }

  // Expression	::=	AssignmentExpression ( "," AssignmentExpression )*
  static read(ctx) {
    ctx.dlog('readExpression');
    ctx.noIn.push(false);
    const assignmentExpression = AssignmentExpression.read(ctx);
    ctx.noIn.pop();
    return assignmentExpression;
  }

  static readNoIn(ctx) {
    ctx.dlog('readExpressionNoIn');
    ctx.noIn.push(true);
    const assignmentExpression = AssignmentExpression.read(ctx);
    ctx.noIn.pop();
    return assignmentExpression;
  }
};

const AssignmentExpression = require('./AssignmentExpression');
