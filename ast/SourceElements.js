const AstItem = require('./AstItem.js');

class SourceElements extends AstItem {
  constructor(children) {
    super(...children);
  }

  static read(ctx) {
    ctx.dlog('readSourceElements');

    const sourceElements = [];
    while (!ctx.itr.done && ctx.itr.peek.v !== '}') {
      ctx.dlog('-----------------------------------------');
      sourceElements.push(SourceElement.read(ctx));
      ctx.skipEmptyLines();
    }
    return new SourceElements(sourceElements);
  }

  run(scope) {
    return this.runChildren(scope);
  }
}

class SourceElement {
  static read(ctx) {
    ctx.dlog('readSourceElement');
    ctx.skipEmptyLines();

    if (ctx.itr.peek.v === 'function') {
      return FunctionDeclaration.read(ctx);
    } else {
      return Statement.read(ctx);
    }
  }
}

module.exports = {
  SourceElement,
  SourceElements
};

const Statement = require('./Statement');
const { FunctionDeclaration } = require('./Function');
