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
    })();

    return literalAst;
  }
}

Literal.True = new Literal(true);
Literal.False = new Literal(false);

module.exports = Literal;
