const AstItem = require('./AstItem');
module.exports = class ImportStatement extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
