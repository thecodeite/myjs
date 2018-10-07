const AstItem = require('./AstItem');

module.exports = class ElementList extends AstItem {
  constructor(elements) {
    super(...elements);
    this.elements = elements;
  }

  run(scope) {
    return this.elements.map(el => el.run(scope));
  }

  // ElementList	::=	( Elision )? AssignmentExpression ( Elision AssignmentExpression )*
  static read(ctx) {
    ctx.dlog('readElementList');
    const elements = [AssignmentExpression.read(ctx)];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      elements.push(AssignmentExpression.read(ctx));
    }

    return new ElementList(elements);
  }
};

const AssignmentExpression = require('./AssignmentExpression');
