function isLiteral(ctx) {
  return (
    (ctx.itr.peek.v === 'null') |
    (ctx.itr.peek.v === 'true') |
    (ctx.itr.peek.v === 'false') |
    (ctx.itr.peek.v === 'undefined') |
    (ctx.itr.peek.t === 'number') |
    (ctx.itr.peek.t === 'string')
  );
}

class PrimaryExpression {
  constructor() {
    throw new Error();
  }

  // PrimaryExpression	::=
  //   "this"
  //   |	ObjectLiteral
  //   |	( "(" Expression ")" )
  //   |	Identifier
  //   |	ArrayLiteral
  //   |	Literal
  static read(ctx) {
    ctx.dlog('readPrimaryExpression');
    const peek = ctx.itr.peek.v;
    if (peek === 'this') throw new NotImplementedError('this');
    if (peek === '{') return ObjectLiteral.read(ctx);
    if (peek === '[') return ArrayLiteral.read(ctx);
    if (peek === '(') {
      ctx.itr.read('(');
      const exp = Expression.read(ctx);
      ctx.itr.read(')');
      return exp;
    }
    if (isLiteral(ctx)) return Literal.read(ctx);

    return Identifier.read(ctx);
  }
}

module.exports = PrimaryExpression;

const Identifier = require('./Identifier');
const Literal = require('./Literal');
const ObjectLiteral = require('./ObjectLiteral');
const ArrayLiteral = require('./ArrayLiteral');
const Expression = require('./Expression');
