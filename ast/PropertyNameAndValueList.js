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
    const elements = [PropertyNameAndValue.read(ctx)];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      elements.push(PropertyNameAndValue.read(ctx));
    }

    return new PropertyNameAndValueList(...elements);
  }
};

const PropertyNameAndValue = require('./PropertyNameAndValue');
