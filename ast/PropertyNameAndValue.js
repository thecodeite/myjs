const AstItem = require('./AstItem');
const Identifier = require('./Identifier');

module.exports = class PropertyNameAndValue extends AstItem {
  constructor(key, value) {
    super(value);
    if (!key instanceof Identifier) {
      throw new Error('key must be Identifier');
    }
    this.key = key;
    this.value = value;
  }

  run(scope) {
    return {
      key: this.key.name,
      value: this.value.run(scope)
    };
  }

  // PropertyNameAndValue	::=	PropertyName ":" AssignmentExpression
  static read(ctx) {
    ctx.dlog('readPropertyNameAndValue');
    const name = PropertyName.read(ctx);
    ctx.itr.read(':');
    const value = AssignmentExpression.read(ctx);
    return new PropertyNameAndValue(name, value);
  }
};

const PropertyName = require('./PropertyName');
const AssignmentExpression = require('./AssignmentExpression');
