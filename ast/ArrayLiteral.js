const AstItem = require('./AstItem');
const StorageSlot = require('./helpers/StorageSlot');

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
    ctx.skipEmptyLines();

    const elementList =
      ctx.itr.peek.v === ']' ? new ElementList([]) : ElementList.read(ctx);
    ctx.itr.read(']');
    return new ArrayLiteral(elementList);
  }
};

const ElementList = require('./ElementList');
