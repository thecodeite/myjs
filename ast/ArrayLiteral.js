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
};
