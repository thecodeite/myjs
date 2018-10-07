const AstItem = require('./AstItem');
const StorageSlot = require('./helpers/StorageSlot');

module.exports = class ObjectLiteral extends AstItem {
  constructor(propertyNameAndValueList) {
    super(...[propertyNameAndValueList].filter(x => x));
    this.propertyNameAndValueList = propertyNameAndValueList;
  }

  run(scope) {
    if (!this.propertyNameAndValueList) {
      return new StorageSlot({});
    }
    const keyValues = this.propertyNameAndValueList.run(scope);

    const value = keyValues.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return new StorageSlot(value);
  }

  // ObjectLiteral	::=	"{" ( PropertyNameAndValueList )? "}"
  static read(ctx) {
    ctx.dlog('readObjectLiteral');
    ctx.itr.read('{');
    let values = null;
    if (ctx.itr.peek.v !== '}') {
      values = PropertyNameAndValueList.read(ctx);
    }
    ctx.itr.read('}');

    return new ObjectLiteral(values);
  }
};

const PropertyNameAndValueList = require('./PropertyNameAndValueList');
