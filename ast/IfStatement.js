const AstItem = require('./AstItem.js');

module.exports = class IfStatement extends AstItem {
  constructor(expression, statement, elseStatement) {
    super(...[expression, statement, elseStatement].filter(Boolean));

    this.expression = expression;
    this.statement = statement;
    this.elseStatement = elseStatement;
  }

  run(scope) {
    const expressionValue = this.expression.run(scope).valueOf();
    if (expressionValue) {
      this.statement.run(scope);
    } else if (this.elseStatement) {
      this.elseStatement.run(scope);
    }
  }

  // IfStatement	::=	"if" "(" Expression ")" Statement ( "else" Statement )?
  static read(ctx) {
    ctx.dlog('readIfStatement');
    ctx.itr.read('if');
    ctx.itr.read('(');
    const expression = require('../old/parser').readExpression(ctx);
    ctx.itr.read(')');
    const statement = require('../old/parser').readStatement(ctx);

    let elseStatement;
    if (ctx.itr.peek.v === 'else') {
      ctx.itr.read('else');
      elseStatement = require('../old/parser').readStatement(ctx);
    }

    return new IfStatement(expression, statement, elseStatement);
  }
};
