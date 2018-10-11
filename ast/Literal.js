const AstItem = require('./AstItem');
const StorageSlot = require('./helpers/StorageSlot');

function readNumber(ctx) {
  ctx.dlog('readNumber');
  const num = ctx.itr.read();
  return new Literal(parseFloat(num));
}

function readString(ctx) {
  ctx.dlog('readString');
  const str = ctx.itr.read();
  return new Literal(str);
}

class Literal extends AstItem {
  constructor(value) {
    super();
    this.value = value;
  }

  run() {
    return new StorageSlot(this.value);
  }

  toString(pad = '') {
    return `${pad}[Literal:'${this.value}']`;
  }

  static is(ctx) {
    return (
      (ctx.itr.peek.v === 'null') |
      (ctx.itr.peek.v === 'true') |
      (ctx.itr.peek.v === 'false') |
      (ctx.itr.peek.v === 'undefined') |
      (ctx.itr.peek.t === 'number') |
      (ctx.itr.peek.t === 'string') |
      (ctx.itr.peek.t === 'regexp')
    );
  }

  // Literal	::=	(
  //   <DECIMAL_LITERAL>
  //   | <HEX_INTEGER_LITERAL>
  //   | <STRING_LITERAL>
  //   | <BOOLEAN_LITERAL>
  //   | <NULL_LITERAL>
  //   | <REGULAR_EXPRESSION_LITERAL>
  // )
  static read(ctx) {
    ctx.dlog('readLiteral');
    const literalAst = (() => {
      if (ctx.itr.peek.t === 'string') return readString(ctx);
      if (ctx.itr.peek.t === 'number') return readNumber(ctx);
      if (ctx.itr.peek.t === 'regexp') return RegExpLiteral.read(ctx);
      if (ctx.itr.peek.v === 'null') {
        ctx.itr.read('null');
        return new Literal(null);
      }
      if (ctx.itr.peek.v === 'true') {
        ctx.itr.read('true');
        return new Literal(true);
      }
      if (ctx.itr.peek.v === 'false') {
        ctx.itr.read('false');
        return new Literal(false);
      }
      if (ctx.itr.peek.v === 'undefined') {
        ctx.itr.read('undefined');
        return new Literal(undefined);
      }

      throw new Error(
        'Expected to read a literal but got ' + JSON.stringify(ctx.itr.peek)
      );
    })();

    return literalAst;
  }
}

Literal.True = new Literal(true);
Literal.False = new Literal(false);

const RegExpLiteral = require('./RegExpLiteral');

module.exports = Literal;
