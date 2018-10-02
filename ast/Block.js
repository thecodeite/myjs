const AstItem = require('./AstItem.js');
const StatementList = require('./StatementList.js');

module.exports = class Block extends AstItem {
  constructor(statementList) {
    super(statementList);
    this.mustBe(() => statementList, StatementList);
    this.statementList = statementList;
  }
};
