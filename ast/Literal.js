const AstItem = require('./AstItem');
const StorageSlot = require('./helpers/StorageSlot');

class Literal extends AstItem {
  constructor(value) {
    super();
    this.value = value;
  }

  run() {
    return new StorageSlot(this.value);
  }

  toString(pad = '') {
    return `${pad}[Literal:'${this.value}']`;
  }
}

Literal.True = new Literal(true);
Literal.False = new Literal(false);

module.exports = Literal;
