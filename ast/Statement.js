const AstItem = require('./AstItem.js');

const idStatements = () => ({
  return: require('../old/parser').readReturnStatement,
  var: require('../old/parser').readVariableStatement,
  do: require('../old/parser').readIterationStatement,
  while: require('../old/parser').readIterationStatement,
  for: require('../old/parser').readIterationStatement,
  if: require('../old/parser').readIfStatement,
  continue: require('../old/parser').readContinue,
  break: require('../old/parser').readBreak,
  import: () => {
    throw new NotImplementedError('readStatement: import');
  },
  with: () => {
    throw new NotImplementedError('readStatement: with');
  },
  switch: require('../old/parser').readSwitchStatement,
  throw: require('../old/parser').readThrowStatement,
  try: require('../old/parser').readTryStatement
});

module.exports = class Statement extends AstItem {
  constructor(...children) {
    super(...children);
  }

  /* Statement	::=	Block
    |	VariableStatement
    |	EmptyStatement
    |	LabelledStatement
    |	ExpressionStatement
    |	IfStatement
    |	IterationStatement
    |	ContinueStatement
    |	BreakStatement
    |	ImportStatement
    |	ReturnStatement
    |	WithStatement
    |	SwitchStatement
    |	ThrowStatement
    |	TryStatement */
  static read(ctx) {
    ctx.dlog('readStatement');
    ctx.skipEmptyLines(ctx);
    const peek = ctx.itr.peek.v;
    ctx.dlog('peek:', peek);

    if (peek === ';') {
      return require('../old/parser').readEmptyStatement(ctx);
    } else if (peek === '{') {
      return require('../old/parser').readBlock(ctx);
    } else if (idStatements()[peek]) {
      return idStatements()[peek](ctx);
    } else {
      return require('../old/parser').readExpressionStatement(ctx);
    }
  }
};
