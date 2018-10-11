const AstItem = require('./AstItem');
const StorageSlot = require('./helpers/StorageSlot');

module.exports = class RegExpLiteral extends AstItem {
  constructor(pattern, flags) {
    super();
    this.pattern = pattern;
    this.flags = flags;
  }

  run(scope) {
    return new StorageSlot(new RegExp(this.pattern, this.flags));
  }

  // <REGULAR_EXPRESSION_LITERAL>
  static read(ctx) {
    ctx.dlog('readRegExpLiteral');
    ctx.itr.read();
    return new RegExpLiteral(ctx.itr.peek.v, ctx.itr.peek.f);
  }
};

const RegExpLiteral = require('./RegExpLiteral');
