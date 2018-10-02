const AstItem = require('./AstItem');

module.exports = class ElementList extends AstItem {
  constructor(elements) {
    super(...elements);
    this.elements = elements;
  }

  run(scope) {
    return this.elements.map(el => el.run(scope));
  }
};
