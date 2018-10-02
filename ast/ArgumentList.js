const AstItem = require('./AstItem');

module.exports = class ArgumentList extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    return this.children.map(child => child.run(scope));
  }
};
