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
};
