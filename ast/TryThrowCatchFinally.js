const { Scope } = require('./helpers/Scope');
const AstItem = require('./AstItem');

class ThrowStatement extends AstItem {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  run(scope) {
    const error = this.expression.run(scope);
    scope.__error = error;
  }

  // ThrowStatement	::=	"throw" Expression ( ";" )?
  static read(ctx) {
    ctx.dlog('readTryStatement');
    ctx.itr.read('throw');
    const expression = require('../old/parser').readExpression(ctx);
    ctx.skipSemi(ctx);
    return new ThrowStatement(expression);
  }
}

class TryStatement extends AstItem {
  constructor(block, catchBlock, finallyBlock) {
    super(...[block, catchBlock, finallyBlock].filter(Boolean));

    this.block = block;
    this.catchBlock = catchBlock;
    this.finallyBlock = finallyBlock;
  }

  run(scope) {
    const newScope = new Scope(scope);

    this.block.run(newScope);

    if (this.catchBlock && '__error' in newScope) {
      this.catchBlock.run(newScope);
    }

    if (this.finallyBlock) {
      this.finallyBlock.run(newScope);
    }
  }

  // TryStatement	::=	"try" Block ( ( Finally | Catch ( Finally )? ) )
  static read(ctx) {
    ctx.dlog('readTryStatement');
    ctx.itr.read('try');
    const block = require('../old/parser').readBlock(ctx);
    let catchBlock, finallyBlock;
    if (ctx.itr.peek.v === 'finally') {
      finallyBlock = require('../old/parser').readFinally(ctx);
    } else {
      catchBlock = require('../old/parser').readCatch(ctx);
      if (ctx.itr.peek.v === 'finally') {
        finallyBlock = require('../old/parser').readFinally(ctx);
      }
    }
    return new TryStatement(block, catchBlock, finallyBlock);
  }
}

class Catch extends AstItem {
  constructor(identifier, block) {
    super(identifier, block);
    this.identifier = identifier;
    this.block = block;
  }

  run(scope) {
    scope[this.identifier.name] = scope.__error;
    delete scope.__error;
    this.block.run(scope);
  }

  // Catch	::=	"catch" "(" Identifier ")" Block
  static read(ctx) {
    ctx.dlog('readCatch');

    ctx.itr.read('catch');
    ctx.itr.read('(');
    const identifier = require('../old/parser').readIdentifier(ctx);
    ctx.itr.read(')');
    const block = require('../old/parser').readBlock(ctx);
    return new Catch(identifier, block);
  }
}

class Finally extends AstItem {
  constructor(block) {
    super(block);
    this.block = block;
  }

  run(scope) {
    if ('__error' in scope) {
      delete scope.__error;
    }
    this.block.run(scope);
  }

  // Finally	::=	"finally" Block
  static read(ctx) {
    ctx.dlog('readFinally');

    ctx.itr.read('finally');
    const block = require('../old/parser').readBlock(ctx);
    return new Finally(block);
  }
}

module.exports = {
  ThrowStatement,
  TryStatement,
  Catch,
  Finally
};
