const AstItem = require('./AstItem');

module.exports = class Arguments extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
