const AstItem = require('./AstItem');

module.exports = class Arguments extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    return this.runChildren(scope);
  }

  // Arguments	::=	"(" ( ArgumentList )? ")"
  static read(ctx) {
    ctx.itr.read('(');
    let argList = [];
    if (ctx.itr.peek.v !== ')') {
      argList = [require('../old/parser').readArgumentList(ctx)];
    }
    ctx.itr.read(')');
    return new Arguments(...argList);
  }
};
