const AstItem = require('./AstItem');
module.exports = class Name extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
