const AstItem = require('./AstItem');

module.exports = class ArgumentList extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    return this.children.map(child => child.run(scope));
  }

  static read(ctx) {
    return ArgumentList.read(ctx);
  }

  // ArgumentList	::=	AssignmentExpression ( "," AssignmentExpression )*
  static read(ctx) {
    ctx.dlog('readArgumentList');
    const argumentList = [AssignmentExpression.read(ctx)];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      argumentList.push(AssignmentExpression.read(ctx));
    }

    return new ArgumentList(...argumentList);
  }
};

const AssignmentExpression = require('./AssignmentExpression');
