const AstItem = require('./AstItem.js');

const AssignmentExpression = require('./AssignmentExpression');

module.exports = class Initialiser extends AstItem {
  constructor(...children) {
    super(...children);
  }

  // Initialiser	::=	"=" AssignmentExpression
  static read(ctx) {
    ctx.dlog('readInitialiser');
    ctx.itr.read('=');

    return AssignmentExpression.read(ctx);
  }
};
