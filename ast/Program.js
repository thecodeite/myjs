const AstItem = require('./AstItem.js');
const { SourceElements } = require('./SourceElements');

class Program extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    this.runChildren(scope);
    if ('__error' in scope) {
      console.error('Uncaught exception:', scope.__error);
    }
  }
}

// Program ::= ( SourceElements )? <EOF>
Program.read = ctx => {
  ctx.dlog('read.Program');
  const elements = SourceElements.read(ctx);
  return new Program(elements);
};

module.exports = Program;
