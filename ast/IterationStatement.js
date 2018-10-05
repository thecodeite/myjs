const AstItem = require('./AstItem.js');
const VariableDeclaration = require('./VariableDeclaration.js');
const LeftHandSideExpression = require('./LeftHandSideExpression.js');
const Literal = require('./Literal.js');

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
      const continueExpression = require('../old/parser').readExpression(ctx);
      ctx.itr.read(')');
      const statement = require('../old/parser').readStatement(ctx);
      ctx.skipSemi(ctx);
      return new IterationStatement('while', { continueExpression }, statement);
    }

    if (ctx.itr.peek.v === 'do') {
      ctx.itr.read('do');

      const statement = require('../old/parser').readStatement(ctx);
      ctx.itr.read('while');
      ctx.itr.read('(');
      const continueExpression = require('../old/parser').readExpression(ctx);
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
        const variableDeclaration = require('../old/parser').readVariableDeclarationList(
          ctx
        );
        if (ctx.itr.peek.v === ';') {
          ctx.itr.read(';');
          const continueExpression = require('../old/parser').readExpression(
            ctx
          );
          ctx.itr.read(';');
          const finalExpression = require('../old/parser').readExpression(ctx);
          ctx.itr.read(')');
          const statement = require('../old/parser').readStatement(ctx);

          return new IterationStatement(
            'for-var',
            { variableDeclaration, continueExpression, finalExpression },
            statement
          );
        } else if (ctx.itr.peek.v === 'in') {
          ctx.itr.read('in');
          const valueExpression = require('../old/parser').readExpression(ctx);
          ctx.itr.read(')');
          const statement = require('../old/parser').readStatement(ctx);

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
        const expression = require('../old/parser').readExpressionNoIn(ctx);
        if (ctx.itr.peek.v === ';') {
          const initializationExpression = expression;
          ctx.itr.read(';');
          const continueExpression = require('../old/parser').readExpression(
            ctx
          );
          ctx.itr.read(';');
          const finalExpression = require('../old/parser').readExpression(ctx);
          ctx.itr.read(')');
          const statement = require('../old/parser').readStatement(ctx);

          return new IterationStatement(
            'for',
            { initializationExpression, continueExpression, finalExpression },
            statement
          );
        } else if (ctx.itr.peek.v === 'in') {
          const leftHandSideExpression = expression;
          ctx.itr.read('in');
          const valueExpression = require('../old/parser').readExpression(ctx);
          ctx.itr.read(')');
          const statement = require('../old/parser').readStatement(ctx);

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
