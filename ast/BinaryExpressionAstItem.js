const AstItem = require('./AstItem');

module.exports = class BinaryExpressionAstItem extends AstItem {
  constructor(left, right) {
    super(...[left, right].filter(x => x));
    this.left = left;
    this.right = right;
  }
};
