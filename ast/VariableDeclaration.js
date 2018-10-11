const StorageSlot = require('./helpers/StorageSlot');
const AstItem = require('./AstItem');

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
      scope.addSlot(id, this.initialiser.run(scope));
    } else {
      scope.addValue(id, undefined);
    }
  }

  toString(pad = '') {
    return `${pad}[VariableDeclaration'${this.identifier.name}']`;
  }

  // VariableDeclaration	::=	Identifier ( Initialiser )?
  static read(ctx) {
    ctx.dlog('readVariableDeclaration');
    const identifier = Identifier.read(ctx);
    const initialiser = ctx.itr.peek.v === '=' ? Initialiser.read(ctx) : null;
    return new VariableDeclaration(identifier, initialiser);
  }
};

const Initialiser = require('./Initialiser');
const Identifier = require('./Identifier');
