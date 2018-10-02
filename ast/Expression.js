const AstItem = require('./AstItem');

module.exports = class Expression extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
