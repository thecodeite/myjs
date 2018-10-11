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
    ctx.skipEmptyLines();
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      ctx.skipEmptyLines();
      elements.push(AssignmentExpression.read(ctx));
      ctx.skipEmptyLines();
    }

    return new ElementList(elements);
  }
};

const AssignmentExpression = require('./AssignmentExpression');
