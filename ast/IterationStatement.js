const AstItem = require('./AstItem.js');

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
        storageSlot = scope.getSlot(varName);
      } else if (leftHandSideExpression) {
        storageSlot = leftHandSideExpression.run(scope);
      }

      const value = valueExpression.run(scope);
      const keys = Object.keys(value.data);

      for (var i = 0; i < keys.length; i++) {
        storageSlot.set(keys[i]);
        this.statement.run(scope);

        if (scope.getBreak()) {
          scope.clearBreak();
          break;
        }
        if (scope.getContinue()) {
          scope.clearContinue();
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
      if (scope.getBreak()) {
        scope.clearBreak();
        break;
      }
      if (scope.getContinue()) {
        delete scope.clearContinue();
      }
      if (finalExpression) {
        finalExpression.run(scope);
      }
      loop = continueExpression.run(scope).valueOf();
    } while (loop);
  }

  /*
  IterationStatement	::=
  ( "do" Statement "while" "(" Expression ")" ( ";" )? )
  |	( "while" "(" Expression ")" Statement )
  |	( "for" "(" ( ExpressionNoIn )? ";" ( Expression )? ";" ( Expression )? ")" Statement )
  |	( "for" "(" "var" VariableDeclarationList ";" ( Expression )? ";" ( Expression )? ")" Statement )
  |	( "for" "(" "var" VariableDeclarationNoIn "in" Expression ")" Statement )
  |	( "for" "(" LeftHandSideExpressionForIn "in" Expression ")" Statement )
  */
  static read(ctx) {
    ctx.dlog('readIterationStatement');
    if (ctx.itr.peek.v === 'while') {
      ctx.itr.read('while');
      ctx.itr.read('(');
      const continueExpression = Expression.read(ctx);
      ctx.itr.read(')');
      const statement = Statement.read(ctx);
      ctx.skipSemi(ctx);
      return new IterationStatement('while', { continueExpression }, statement);
    }

    if (ctx.itr.peek.v === 'do') {
      ctx.itr.read('do');

      const statement = Statement.read(ctx);
      ctx.itr.read('while');
      ctx.itr.read('(');
      const continueExpression = Expression.read(ctx);
      ctx.itr.read(')');
      ctx.skipSemi(ctx);
      return new IterationStatement(
        'do-while',
        { initialExpression: Literal.True, continueExpression },
        statement
      );
    }

    if (ctx.itr.peek.v === 'for') {
      ctx.itr.read('for');
      ctx.itr.read('(');

      if (ctx.itr.peek.v === 'var') {
        ctx.itr.read('var');
        const variableDeclaration = VariableDeclarationList.read(ctx);
        if (ctx.itr.peek.v === ';') {
          ctx.itr.read(';');
          const continueExpression = Expression.read(ctx);
          ctx.itr.read(';');
          const finalExpression = Expression.read(ctx);
          ctx.itr.read(')');
          const statement = Statement.read(ctx);

          return new IterationStatement(
            'for-var',
            { variableDeclaration, continueExpression, finalExpression },
            statement
          );
        } else if (ctx.itr.peek.v === 'in') {
          ctx.itr.read('in');
          const valueExpression = Expression.read(ctx);
          ctx.itr.read(')');
          const statement = Statement.read(ctx);

          return new IterationStatement(
            'for-var-in',
            { variableDeclaration, valueExpression },
            statement
          );
        } else {
          throw new Error('Unexpected token: ' + ctx.itr.peek.v);
        }
      } else {
        //const leftHandSideExpression = readLeftHandSideExpression(ctx);
        const expression = Expression.readNoIn(ctx);
        if (ctx.itr.peek.v === ';') {
          const initializationExpression = expression;
          ctx.itr.read(';');
          const continueExpression = Expression.read(ctx);
          ctx.itr.read(';');
          const finalExpression = Expression.read(ctx);
          ctx.itr.read(')');
          const statement = Statement.read(ctx);

          return new IterationStatement(
            'for',
            { initializationExpression, continueExpression, finalExpression },
            statement
          );
        } else if (ctx.itr.peek.v === 'in') {
          const leftHandSideExpression = expression;
          ctx.itr.read('in');
          const valueExpression = Expression.read(ctx);
          ctx.itr.read(')');
          const statement = Statement.read(ctx);

          return new IterationStatement(
            'for-var-in',
            { leftHandSideExpression, valueExpression },
            statement
          );
        }
      }
    }

    throw new NotImplementedError('readIterationStatement ' + ctx.itr.peek.v);
  }
};

const Statement = require('./Statement');
const Expression = require('./Expression');
const VariableDeclaration = require('./VariableDeclaration.js');
const VariableDeclarationList = require('./VariableDeclarationList.js');
const LeftHandSideExpression = require('./LeftHandSideExpression.js');
const Literal = require('./Literal.js');
