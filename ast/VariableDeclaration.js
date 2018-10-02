const StorageSlot = require('./helpers/StorageSlot');
const AstItem = require('./AstItem');
const Identifier = require('./Identifier');

module.exports = class VariableDeclaration extends AstItem {
  constructor(identifier, initialiser) {
    super(...[initialiser].filter(Boolean));

    this.mustBe(() => identifier, Identifier);

    this.identifier = identifier;
    this.initialiser = initialiser;
  }

  run(scope) {
    const id = this.identifier.name;
    if (this.initialiser) {
      scope[id] = this.initialiser.run(scope);
    } else {
      scope[id] = new StorageSlot(undefined);
    }
  }

  toString(pad = '') {
    return `${pad}[VariableDeclaration'${this.identifier.name}']`;
  }
};
