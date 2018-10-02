const AstItem = require('./AstItem.js');

module.exports = class LabelledStatement extends AstItem {
  constructor(...children) {
    super(...children);
  }
};
