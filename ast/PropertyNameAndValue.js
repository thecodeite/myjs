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
};
