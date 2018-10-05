const AstItem = require('./AstItem');

module.exports = class ArgumentList extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    return this.children.map(child => child.run(scope));
  }

  static read(ctx) {
    return require('../old/parser').readArgumentList(ctx);
  }

  // ArgumentList	::=	AssignmentExpression ( "," AssignmentExpression )*
  static read(ctx) {
    ctx.dlog('readArgumentList');
    const argumentList = [
      require('../old/parser').readAssignmentExpression(ctx)
    ];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      argumentList.push(require('../old/parser').readAssignmentExpression(ctx));
    }

    return new ArgumentList(...argumentList);
  }
};
