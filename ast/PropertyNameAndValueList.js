const AstItem = require('./AstItem');

module.exports = class PropertyNameAndValueList extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    return this.children.map(x => x.run(scope));
  }
};
