const AstItem = require('./AstItem.js');

module.exports = class ContinueStatement extends AstItem {
  constructor() {
    super();
  }

  run(scope) {
    scope.__continue = true;
  }
};
