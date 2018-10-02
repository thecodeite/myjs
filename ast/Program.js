const AstItem = require('./AstItem.js');
const globalScope = require('../global');

module.exports = class Program extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    scope.__parentScope = globalScope();
    super.run(scope);
    if ('__error' in scope) {
      console.error('Uncaught exception:', scope.__error);
    }
  }
};
