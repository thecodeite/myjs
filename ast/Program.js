const AstItem = require('./AstItem.js');
const CompileError = require('./helpers/CompileError');
const { ParsingError } = require('../tokenizer');

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

  // Program ::= ( SourceElements )? <EOF>
  static read(ctx) {
    ctx.dlog('read.Program');
    try {
      const elements = SourceElements.read(ctx);
      return new Program(elements);
    } catch (e) {
      if (e instanceof CompileError || e instanceof ParsingError) {
        throw e;
      } else {
        console.log(e);
        throw new CompileError(e, ctx);
      }
    }
  }
}

module.exports = Program;

const { SourceElements } = require('./SourceElements');
