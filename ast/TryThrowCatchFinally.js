const Scope = require('./helpers/Scope');
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
}

module.exports = {
  ThrowStatement,
  TryStatement,
  Catch,
  Finally
};
