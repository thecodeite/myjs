const AstItem = require('./AstItem');

module.exports = class VariableStatement extends AstItem {
  constructor(child) {
    super(child);
  }
};
