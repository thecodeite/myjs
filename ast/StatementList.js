const AstItem = require('./AstItem.js');

module.exports = class StatementList extends AstItem {
  constructor(statements) {
    super(...statements);
    this.statements = statements;
  }

  run(scope) {
    for (let statement of this.statements) {
      statement.run(scope);

      if (
        '__break' in scope ||
        '__continue' in scope ||
        '__returnValue' in scope ||
        '__error' in scope
      ) {
        return;
      }
    }
  }
};
