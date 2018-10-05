const AstItem = require('./AstItem.js');

module.exports = class EmptyStatement extends AstItem {
  constructor() {
    super();
  }

  // EmptyStatement	::=	";"
  static read(ctx) {
    ctx.itr.read(';');
    return new EmptyStatement();
  }
};
