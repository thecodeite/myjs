const AstItem = require('./AstItem.js');

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
      return EmptyStatement.read(ctx);
    } else if (peek === '{') {
      return Block.read(ctx);
    } else if (idStatements()[peek]) {
      return idStatements()[peek](ctx);
    } else {
      return ExpressionStatement.read(ctx);
    }
  }
};

const EmptyStatement = require('./EmptyStatement');
const ExpressionStatement = require('./ExpressionStatement');
const Block = require('./Block');

const notImplemented = str => () => {
  throw new NotImplementedError(str);
};

const idStatements = () => ({
  return: require('./ReturnStatement').read,
  var: require('./VariableStatement').read,
  do: require('./IterationStatement').read,
  while: require('./IterationStatement').read,
  for: require('./IterationStatement').read,
  if: require('./IfStatement').read,
  continue: require('./ContinueStatement').read,
  break: require('./BreakStatement').read,
  import: notImplemented('readStatement: import'),
  with: notImplemented('readStatement: with'),
  switch: require('./switch').SwitchStatement.read,
  throw: require('./TryThrowCatchFinally').ThrowStatement.read,
  try: require('./TryThrowCatchFinally').TryStatement.read
});
