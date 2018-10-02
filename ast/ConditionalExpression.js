const AstItem = require('./AstItem');

module.exports = class ConditionalExpression extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
