const AstItem = require('./AstItem');

module.exports = class VariableDeclarationList extends AstItem {
  constructor(variableDeclarations) {
    super(...variableDeclarations);
    this.variableDeclarations = variableDeclarations;
  }

  run(scope) {
    for (var variableDeclaration of this.variableDeclarations) {
      variableDeclaration.run(scope);
    }
  }
};
