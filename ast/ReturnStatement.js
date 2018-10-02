const AstItem = require('./AstItem.js');

module.exports = class ReturnStatement extends AstItem {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  run(scope) {
    scope.__returnValue = this.expression.run(scope);
    return scope.__returnValue;
  }
};
