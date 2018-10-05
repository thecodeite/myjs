const { Scope } = require('./helpers/Scope.js');
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

  // SwitchStatement	::=	"switch" "(" Expression ")" CaseBlock
  static read(ctx) {
    ctx.dlog('readSwitchStatement');
    ctx.itr.read('switch');
    ctx.itr.read('(');
    const expression = require('../old/parser').readExpression(ctx);
    ctx.itr.read(')');
    const caseBlock = require('../old/parser').readCaseBlock(ctx);

    return new SwitchStatement(expression, caseBlock);
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

  // CaseBlock	::=	"{" ( CaseClauses )? ( "}" | DefaultClause ( CaseClauses )? "}" )
  static read(ctx) {
    ctx.dlog('readCaseBlock');
    ctx.itr.read('{');

    const clausesA = [...require('../old/parser').readCaseClauses(ctx)];
    let defaultClause = [];
    let clausesB = [];
    if (ctx.itr.peek.v !== '}') {
      defaultClause = [...require('../old/parser').readDefaultClause(ctx)];
      clausesB = [...require('../old/parser').readCaseClauses(ctx)];
    }

    ctx.skipEmptyLines(ctx);
    ctx.itr.read('}');
    const clauses = [...clausesA, ...defaultClause, ...clausesB];
    return new CaseBlock(clauses);
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

  // CaseClause	::=	( ( "case" Expression ":" ) ) ( StatementList )?
  static read(ctx) {
    ctx.dlog('readCaseClause');
    ctx.itr.read('case');
    const expression = require('../old/parser').readExpression(ctx);
    ctx.itr.read(':');
    const statementList = require('../old/parser').readStatementList(ctx, [
      'case',
      'default',
      '}'
    ]);
    return new CaseClause(expression, statementList);
  }
}

class CaseClauses extends AstItem {
  // CaseClauses	::=	( CaseClause )+
  static *read(ctx) {
    ctx.dlog('readCaseClauses');
    ctx.skipEmptyLines(ctx);
    while (ctx.itr.peek.v === 'case') {
      yield require('../old/parser').readCaseClause(ctx);
      ctx.skipEmptyLines(ctx);
    }
  }
}

class DefaultClause extends Clause {
  constructor(statementList) {
    super(null, statementList);
  }

  // DefaultClause	::=	( ( "default" ":" ) ) ( StatementList )?
  static *read(ctx) {
    ctx.dlog('readDefaultClause');
    if (ctx.itr.peek.v !== 'default') return;
    ctx.itr.read('default');
    ctx.itr.read(':');
    const statementList = require('../old/parser').readStatementList(ctx, [
      'case',
      'default',
      '}'
    ]);

    yield new DefaultClause(statementList);
  }
}

module.exports = {
  SwitchStatement,
  CaseBlock,
  Clause,
  CaseClause,
  CaseClauses,
  DefaultClause
};
