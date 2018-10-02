const AstItem = require('./AstItem.js');

module.exports = class WithStatement extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
