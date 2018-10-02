const AstItem = require('./AstItem.js');
const VariableDeclaration = require('./VariableDeclaration.js');
const LeftHandSideExpression = require('./LeftHandSideExpression.js');

module.exports = class IterationStatement extends AstItem {
  constructor(name, expressions, statement) {
    super(...[...Object.values(expressions), statement]);
    this.name = name;
    this.expressions = expressions;
    this.statement = statement;
  }

  run(scope) {
    const {
      variableDeclaration,
      initialExpression,
      continueExpression,
      finalExpression,
      valueExpression,
      leftHandSideExpression,
      initializationExpression
    } = this.expressions;

    if (valueExpression) {
      if (!variableDeclaration && !leftHandSideExpression) {
        if (!variableDeclaration instanceof VariableDeclaration) {
          throw new Error('in expects VariableDeclaration');
        }
        if (!leftHandSideExpression instanceof LeftHandSideExpression) {
          throw new Error('in expects VariableDeclaration');
        }
      }

      let storageSlot;
      if (variableDeclaration) {
        const varName = variableDeclaration.identifier.name;
        variableDeclaration.run(scope);
        storageSlot = scope[varName];
      } else if (leftHandSideExpression) {
        storageSlot = leftHandSideExpression.run(scope);
      }

      const value = valueExpression.run(scope);
      const keys = Object.keys(value.data);

      for (var i = 0; i < keys.length; i++) {
        storageSlot.set(keys[i]);
        this.statement.run(scope);

        if (scope.__break) {
          delete scope.__break;
          break;
        }
        if (scope.__continue) {
          delete scope.__continue;
        }
      }

      return;
    }

    if (variableDeclaration) variableDeclaration.run(scope);
    if (initializationExpression) initializationExpression.run(scope);

    const initialExpressionValue = (initialExpression || continueExpression)
      .run(scope)
      .valueOf();

    if (!initialExpressionValue) return;

    let loop;
    do {
      this.statement.run(scope);
      if (scope.__break) {
        delete scope.__break;
        break;
      }
      if (scope.__continue) {
        delete scope.__continue;
      }
      if (finalExpression) {
        finalExpression.run(scope);
      }
      loop = continueExpression.run(scope).valueOf();
    } while (loop);
  }
};
