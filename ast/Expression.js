const AstItem = require('./AstItem');

module.exports = class Expression extends AstItem {
  constructor(assignmentExpressions) {
    super();
  }

  // Expression	::=	AssignmentExpression ( "," AssignmentExpression )*
  static read(ctx) {
    ctx.dlog('readExpression');
    ctx.noIn.push(false);
    const assignmentExpression = require('../old/parser').readAssignmentExpression(
      ctx
    );
    ctx.noIn.pop();
    return assignmentExpression;
  }

  static readNoIn(ctx) {
    ctx.dlog('readExpressionNoIn');
    ctx.noIn.push(true);
    const assignmentExpression = require('../old/parser').readAssignmentExpression(
      ctx
    );
    ctx.noIn.pop();
    return assignmentExpression;
  }
};
