const AstItem = require('./AstItem.js');

module.exports = class ExpressionStatement extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
