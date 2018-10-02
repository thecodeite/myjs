const AstItem = require('./AstItem.js');

module.exports = class EmptyStatement extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
