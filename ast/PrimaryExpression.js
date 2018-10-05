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
    if (peek === '{') return require('../old/parser').readObjectLiteral(ctx);
    if (peek === '[') return require('../old/parser').readArrayLiteral(ctx);
    if (peek === '(') {
      ctx.itr.read('(');
      const exp = require('../old/parser').readExpression(ctx);
      ctx.itr.read(')');
      return exp;
    }
    if (isLiteral(ctx)) return require('../old/parser').readLiteral(ctx);

    return require('../old/parser').readIdentifier(ctx);
  }
}

module.exports = PrimaryExpression;
