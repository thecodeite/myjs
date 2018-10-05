const AstItem = require('./AstItem.js');

module.exports = class Initialiser extends AstItem {
  constructor(...children) {
    super(...children);
  }

  // Initialiser	::=	"=" AssignmentExpression
  static read(ctx) {
    ctx.dlog('readInitialiser');
    ctx.itr.read('=');

    return require('../old/parser').readAssignmentExpression(ctx);
  }
};
