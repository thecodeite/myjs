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
    if (peek === 'this') {
      ctx.itr.read('this');
      return new Identifier('this');
    }
    if (peek === '{') return ObjectLiteral.read(ctx);
    if (peek === '[') return ArrayLiteral.read(ctx);
    if (peek === '(') {
      ctx.itr.read('(');
      const exp = Expression.read(ctx);
      ctx.itr.read(')');
      return exp;
    }
    if (Literal.is(ctx)) return Literal.read(ctx);

    return Identifier.read(ctx);
  }
}

module.exports = PrimaryExpression;

const Identifier = require('./Identifier');
const Literal = require('./Literal');
const ObjectLiteral = require('./ObjectLiteral');
const ArrayLiteral = require('./ArrayLiteral');
const Expression = require('./Expression');
