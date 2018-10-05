const AstItem = require('./AstItem');

module.exports = class PropertyName extends AstItem {
  constructor() {
    throw new Error('Not used');
  }

  // PropertyName	::=	Identifier |	<STRING_LITERAL>	|	<DECIMAL_LITERAL>
  static read(ctx) {
    ctx.dlog('readPropertyName');
    if (ctx.itr.peek.t === 'string' || ctx.itr.peek.t === 'number') {
      return require('../old/parser').readLiteral(ctx);
    } else {
      return require('../old/parser').readIdentifier(ctx);
    }
  }
};
