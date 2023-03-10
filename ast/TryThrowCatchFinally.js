const { Scope } = require('./helpers/Scope');
const AstItem = require('./AstItem');

class ThrowStatement extends AstItem {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  run(scope) {
    const error = this.expression.run(scope);
    scope.setError(error);
  }

  // ThrowStatement	::=	"throw" Expression ( ";" )?
  static read(ctx) {
    ctx.dlog('readTryStatement');
    ctx.itr.read('throw');
    const expression = Expression.read(ctx);
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
    const newScope = scope.createChild();

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
    const block = Block.read(ctx);
    let catchBlock, finallyBlock;
    if (ctx.itr.peek.v === 'finally') {
      finallyBlock = Finally.read(ctx);
    } else {
      catchBlock = Catch.read(ctx);
      if (ctx.itr.peek.v === 'finally') {
        finallyBlock = Finally.read(ctx);
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
    scope.addSlot(this.identifier.name, scope.getError());
    scope.clearError();
    this.block.run(scope);
  }

  // Catch	::=	"catch" "(" Identifier ")" Block
  static read(ctx) {
    ctx.dlog('readCatch');

    ctx.itr.read('catch');
    ctx.itr.read('(');
    const identifier = Identifier.read(ctx);
    ctx.itr.read(')');
    const block = Block.read(ctx);
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
    const block = Block.read(ctx);
    return new Finally(block);
  }
}

module.exports = {
  ThrowStatement,
  TryStatement,
  Catch,
  Finally
};

const Expression = require('./Expression');
const Block = require('./Block');
const Identifier = require('./Identifier');
