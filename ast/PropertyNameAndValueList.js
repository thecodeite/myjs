const AstItem = require('./AstItem');

module.exports = class PropertyNameAndValueList extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    return this.children.map(x => x.run(scope));
  }

  // PropertyNameAndValueList	::=	PropertyNameAndValue ( "," PropertyNameAndValue | "," )*
  static read(ctx) {
    ctx.dlog('readPropertyNameAndValueList');
    const elements = [require('../old/parser').readPropertyNameAndValue(ctx)];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      elements.push(require('../old/parser').readPropertyNameAndValue(ctx));
    }

    return new PropertyNameAndValueList(...elements);
  }
};
