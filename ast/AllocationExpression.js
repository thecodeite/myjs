const AstItem = require('./AstItem');

module.exports = class AllocationExpression extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
