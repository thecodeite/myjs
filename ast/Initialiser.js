const AstItem = require('./AstItem.js');

module.exports = class Initialiser extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
