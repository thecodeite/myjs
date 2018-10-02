const Scope = require('./helpers/Scope.js');
const AstItem = require('./AstItem.js');
const StatementList = require('./StatementList.js');

class SwitchStatement extends AstItem {
  constructor(expression, caseBlock) {
    super(expression, caseBlock);

    this.expression = expression;
    this.caseBlock = caseBlock;

    this.mustBe(() => caseBlock, CaseBlock);
  }

  run(scope) {
    const expressionValue = this.expression.run(scope);
    const newScope = new Scope(scope);
    newScope.__switchOn = expressionValue;

    this.caseBlock.run(newScope);

    scope.__returnValue = newScope.__returnValue;
    if ('__error' in newScope) {
      scope.__error = newScope.__error;
    }
  }
}

class CaseBlock extends AstItem {
  constructor(clauses) {
    super(...clauses);
    this.clauses = clauses;

    this.allMustBe(() => clauses, Clause);
  }

  run(scope) {
    const clauseValues = this.clauses.map(clause => {
      if (clause instanceof CaseClause) {
        return {
          clause,
          value: clause.expression.run(scope)
        };
      } else if (clause instanceof DefaultClause) {
        return {
          clause,
          isDefault: true
        };
      }
    });

    let startIndex = clauseValues.findIndex(
      x => x.value && x.value.valueOf() === scope.__switchOn.valueOf()
    );

    if (startIndex === -1) {
      startIndex = clauseValues.findIndex(x => x.isDefault);
    }

    if (startIndex !== -1) {
      for (var i = startIndex; i < this.clauses.length; i++) {
        this.clauses[i].statementList.run(scope);

        if (
          '__break' in scope ||
          '__continue' in scope ||
          '__returnValue' in scope
        ) {
          return;
        }
      }
    }
  }
}

class Clause extends AstItem {
  constructor(expression, statementList) {
    if (expression) {
      super(expression, statementList);
    } else {
      super(statementList);
    }

    this.expression = expression;
    this.statementList = statementList;

    this.mustBe(() => statementList, StatementList);
  }
}

class CaseClause extends Clause {
  constructor(expression, statementList) {
    super(expression, statementList);
  }
}

class DefaultClause extends Clause {
  constructor(statementList) {
    super(null, statementList);
  }
}

module.exports = {
  SwitchStatement,
  CaseBlock,
  Clause,
  CaseClause,
  DefaultClause
};
