const AstItem = require('./AstItem.js');

module.exports = class BreakStatement extends AstItem {
  constructor() {
    super();
  }

  run(scope) {
    scope.__break = true;
  }
};
