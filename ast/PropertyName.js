const AstItem = require('./AstItem');

module.exports = class PropertyName extends AstItem {
  constructor() {
    throw new Error('Not used');
  }

  // PropertyName	::=	Identifier |	<STRING_LITERAL>	|	<DECIMAL_LITERAL>
  static read(ctx) {
    ctx.dlog('readPropertyName');
    if (ctx.itr.peek.t === 'string' || ctx.itr.peek.t === 'number') {
      return Literal.read(ctx);
    } else {
      return Identifier.read(ctx);
    }
  }
};

const Literal = require('./Literal');
const Identifier = require('./Identifier');
