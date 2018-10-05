const AstItem = require('./AstItem');
const StorageSlot = require('./helpers/StorageSlot');
const ElementList = require('./ElementList');

module.exports = class ArrayLiteral extends AstItem {
  constructor(elementList) {
    super(elementList);
    this.elementList = elementList;
  }

  run(scope) {
    return new StorageSlot(this.elementList.run(scope));
  }

  // ArrayLiteral	::=	"[" ( ( Elision )? "]" | ElementList Elision "]" | ( ElementList )? "]" )
  static read(ctx) {
    ctx.dlog('readArrayLiteral');
    ctx.itr.read('[');

    const elementList =
      ctx.itr.peek.v === ']' ? new ElementList([]) : ElementList.read(ctx);
    ctx.itr.read(']');
    return new ArrayLiteral(elementList);
  }
};
