const AstItem = require('./AstItem.js');

module.exports = class Block extends AstItem {
  constructor(statementList) {
    super(statementList);
    this.mustBe(() => statementList, StatementList);
    this.statementList = statementList;
  }

  run(scope) {
    return this.runChildren(scope);
  }

  // Block	::=	"{" ( StatementList )? "}"
  static read(ctx) {
    ctx.dlog('readBlock');
    ctx.itr.read('{');
    const statementList = StatementList.read(ctx, ['}']);
    ctx.itr.read('}');

    return new Block(statementList);
  }
};

const StatementList = require('./StatementList.js');
