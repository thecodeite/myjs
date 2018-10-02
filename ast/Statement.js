const AstItem = require('./AstItem.js');

module.exports = class Statement extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
