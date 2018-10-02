const AstItem = require('./AstItem');

module.exports = class MemberExpression extends AstItem {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  run(scope) {
    return this.expression.run(scope);
  }
};
