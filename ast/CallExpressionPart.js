const AstItem = require('./AstItem');

module.exports = class CallExpressionPart extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
