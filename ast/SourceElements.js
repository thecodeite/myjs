const AstItem = require('./AstItem.js');

class SourceElements extends AstItem {
  constructor(children) {
    super(...children);
  }
}

class SourceElement extends AstItem {
  constructor(...children) {
    super(...children);
  }
}

module.exports = {
  SourceElement,
  SourceElements
};
