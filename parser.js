const ast = require('./ast');
const NotImplementedError = require('./NotImplementedError');

const debug = () => process.env.DEBUG === 'true';
const dlog = (...args) => debug() && console.log(...args);

function skipEmptyLines(ctx) {
  while (ctx.itr.peek.t === 'newLine') ctx.itr.read();
}

function skipSemi(ctx) {
  if (ctx.itr.peek.v === ';') ctx.itr.read(';');
}

// Program ::= ( SourceElements )? <EOF>
function readProgram(ctx) {
  dlog('readProgram');
  ctx.noIn = [];
  const elements = readSourceElements(ctx);
  return new ast.Program(elements);
}

// SourceElements ::= ( SourceElement )+
function readSourceElements(ctx) {
  dlog('readSourceElements');

  const sourceElements = [];
  while (!ctx.itr.done && ctx.itr.peek.v !== '}') {
    dlog('-----------------------------------------');
    sourceElements.push(readSourceElement(ctx));
    skipEmptyLines(ctx);
  }
  return new ast.SourceElements(sourceElements);
}

// SourceElement	::=	FunctionDeclaration |	Statement
function readSourceElement(ctx) {
  skipEmptyLines(ctx);
  dlog('readSourceElement', ctx.itr.peek.v);

  if (ctx.itr.peek.v === 'function') {
    return readFunctionDeclaration(ctx);
  } else {
    return readStatement(ctx);
  }
}

// FunctionExpression	::=	"function" ( Identifier )? ( "(" ( FormalParameterList )? ")" ) FunctionBody
function readFunctionExpression(ctx) {
  const {
    identifier,
    params,
    body
  } = readFunctionDeclarationOrFunctionExpression(ctx, false);
  return new ast.FunctionExpression(identifier, params, body);
}

// FunctionDeclaration	::=	 "function" Identifier ( "(" ( FormalParameterList )? ")" ) FunctionBody
function readFunctionDeclaration(ctx) {
  const {
    identifier,
    params,
    body
  } = readFunctionDeclarationOrFunctionExpression(ctx, true);
  return new ast.FunctionDeclaration(identifier, params, body);
}

function readFunctionDeclarationOrFunctionExpression(ctx, identifierRequired) {
  dlog('readFunctionDeclaration');
  ctx.itr.read('function');
  let identifier = null;
  if (ctx.itr.peek.v === '(') {
    if (identifierRequired) {
      throw new Error('Identifier expected');
    }
  } else {
    identifier = readIdentifier(ctx);
  }
  ctx.itr.read('(');
  let params = new ast.FormalParameterList([]);
  if (ctx.itr.peek.v !== ')') {
    params = readFormalParameterList(ctx);
  }
  ctx.itr.read(')');
  const body = readFunctionBody(ctx);

  return { identifier, params, body };
}

// FormalParameterList ::= Identifier ( "," Identifier )*
function readFormalParameterList(ctx) {
  dlog('readFormalParameterList');
  const identifiers = [readIdentifier(ctx)];
  while (ctx.itr.peek.v === ',') {
    ctx.itr.read(',');
    identifiers.push(readIdentifier(ctx));
  }

  return new ast.FormalParameterList(identifiers);
}

function readFunctionBody(ctx) {
  // "{" ( SourceElements )? "}"
  dlog('readFunctionBody');
  ctx.itr.read('{');
  let sourceElements = new ast.SourceElements([]);
  if (ctx.itr.peek.v !== '}') {
    sourceElements = readSourceElements(ctx);
  }
  ctx.itr.read('}');
  return new ast.FunctionBody(sourceElements);
}

// StatementList	::=	( Statement )+
function readStatementList(ctx, terminators) {
  dlog('readStatementList');
  const statements = [];

  while (!terminators.includes(ctx.itr.peek.v)) {
    statements.push(readStatement(ctx));
    skipEmptyLines(ctx);
  }

  return new ast.StatementList(statements);
}

const idStatements = {
  return: readReturnStatement,
  var: readVariableStatement,
  do: readIterationStatement,
  while: readIterationStatement,
  for: readIterationStatement,
  if: readIfStatement,
  continue: readContinue,
  break: readBreak,
  import: () => {
    throw new NotImplementedError('readStatement: import');
  },
  with: () => {
    throw new NotImplementedError('readStatement: with');
  },
  switch: readSwitchStatement,
  throw: () => {
    throw new NotImplementedError('readStatement: throw');
  },
  try: () => {
    throw new NotImplementedError('readStatement: try');
  }
};
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
|	TryStatement
*/
function readStatement(ctx) {
  dlog('readStatement');
  skipEmptyLines(ctx);
  const peek = ctx.itr.peek.v;
  dlog('peek:', peek);

  if (peek === ';') {
    return readEmptyStatement(ctx);
  } else if (peek === '{') {
    return readBlock(ctx);
  } else if (idStatements[peek]) {
    return idStatements[peek](ctx);
  } else {
    return readExpressionStatement(ctx);
  }
}

// SwitchStatement	::=	"switch" "(" Expression ")" CaseBlock
function readSwitchStatement(ctx) {
  dlog('readSwitchStatement');
  ctx.itr.read('switch');
  ctx.itr.read('(');
  const expression = readExpression(ctx);
  ctx.itr.read(')');
  const caseBlock = readCaseBlock(ctx);

  return new ast.SwitchStatement(expression, caseBlock);
}

// CaseBlock	::=	"{" ( CaseClauses )? ( "}" | DefaultClause ( CaseClauses )? "}" )
function readCaseBlock(ctx) {
  dlog('readCaseBlock');
  ctx.itr.read('{');

  const clausesA = [...readCaseClauses(ctx)];
  let defaultClause = [];
  let clausesB = [];
  if (ctx.itr.peek.v !== '}') {
    defaultClause = [...readDefaultClause(ctx)];
    clausesB = [...readCaseClauses(ctx)];
  }

  skipEmptyLines(ctx);
  ctx.itr.read('}');
  const clauses = [...clausesA, ...defaultClause, ...clausesB];
  return new ast.CaseBlock(clauses);
}

// CaseClauses	::=	( CaseClause )+
function* readCaseClauses(ctx) {
  dlog('readCaseClauses');
  skipEmptyLines(ctx);
  while (ctx.itr.peek.v === 'case') {
    yield readCaseClause(ctx);
    skipEmptyLines(ctx);
  }
}

// CaseClause	::=	( ( "case" Expression ":" ) ) ( StatementList )?
function readCaseClause(ctx) {
  dlog('readCaseClause');
  ctx.itr.read('case');
  const expression = readExpression(ctx);
  ctx.itr.read(':');
  const statementList = readStatementList(ctx, ['case', 'default', '}']);
  return new ast.CaseClause(expression, statementList);
}

// DefaultClause	::=	( ( "default" ":" ) ) ( StatementList )?
function* readDefaultClause(ctx) {
  dlog('readDefaultClause');
  if (ctx.itr.peek.v !== 'default') return;
  ctx.itr.read('default');
  ctx.itr.read(':');
  const statementList = readStatementList(ctx, ['case', 'default', '}']);

  yield new ast.DefaultClause(statementList);
}

// ContinueStatement	::=	"continue" ( Identifier )? ( ";" )?
function readContinue(ctx) {
  dlog('readContinue');
  ctx.itr.read('continue');

  let identifier = null;
  if (ctx.itr.peek.t === 'identifier') {
    throw new NotImplementedError('readContinue named continue');
    identifier = readIdentifier(ctx);
  }

  skipSemi(ctx);
  return new ast.ContinueStatement(identifier);
}

// BreakStatement	::=	"break" ( Identifier )? ( ";" )?
function readBreak(ctx) {
  dlog('readBreak');
  ctx.itr.read('break');

  let identifier = null;
  if (ctx.itr.peek.t === 'identifier') {
    throw new NotImplementedError('readBreak named break');
    identifier = readIdentifier(ctx);
  }

  skipSemi(ctx);
  return new ast.BreakStatement(identifier);
}

// IfStatement	::=	"if" "(" Expression ")" Statement ( "else" Statement )?
function readIfStatement(ctx) {
  dlog('readIfStatement');
  ctx.itr.read('if');
  ctx.itr.read('(');
  const expression = readExpression(ctx);
  ctx.itr.read(')');
  const statement = readStatement(ctx);

  let elseStatement;
  if (ctx.itr.peek.v === 'else') {
    ctx.itr.read('else');
    elseStatement = readStatement(ctx);
  }

  return new ast.IfStatement(expression, statement, elseStatement);
}

// Block	::=	"{" ( StatementList )? "}"
function readBlock(ctx) {
  dlog('readBlock');
  ctx.itr.read('{');
  const statementList = readStatementList(ctx, ['}']);
  ctx.itr.read('}');

  return new ast.Block(statementList);
}

/*
IterationStatement	::=	( "do" Statement "while" "(" Expression ")" ( ";" )? )
|	( "while" "(" Expression ")" Statement )
|	( "for" "(" ( ExpressionNoIn )? ";" ( Expression )? ";" ( Expression )? ")" Statement )
|	( "for" "(" "var" VariableDeclarationList ";" ( Expression )? ";" ( Expression )? ")" Statement )
|	( "for" "(" "var" VariableDeclarationNoIn "in" Expression ")" Statement )
|	( "for" "(" LeftHandSideExpressionForIn "in" Expression ")" Statement )
*/
function readIterationStatement(ctx) {
  dlog('readIterationStatement');
  if (ctx.itr.peek.v === 'while') {
    ctx.itr.read('while');
    ctx.itr.read('(');
    const continueExpression = readExpression(ctx);
    ctx.itr.read(')');
    const statement = readStatement(ctx);
    skipSemi(ctx);
    return new ast.IterationStatement(
      'while',
      { continueExpression },
      statement
    );
  }

  if (ctx.itr.peek.v === 'do') {
    ctx.itr.read('do');

    const statement = readStatement(ctx);
    ctx.itr.read('while');
    ctx.itr.read('(');
    const continueExpression = readExpression(ctx);
    ctx.itr.read(')');
    skipSemi(ctx);
    return new ast.IterationStatement(
      'do-while',
      { initialExpression: ast.True, continueExpression },
      statement
    );
  }

  if (ctx.itr.peek.v === 'for') {
    ctx.itr.read('for');
    ctx.itr.read('(');

    if (ctx.itr.peek.v === 'var') {
      ctx.itr.read('var');
      const variableDeclaration = readVariableDeclarationList(ctx);
      if (ctx.itr.peek.v === ';') {
        ctx.itr.read(';');
        const continueExpression = readExpression(ctx);
        ctx.itr.read(';');
        const finalExpression = readExpression(ctx);
        ctx.itr.read(')');
        const statement = readStatement(ctx);

        return new ast.IterationStatement(
          'for-var',
          { variableDeclaration, continueExpression, finalExpression },
          statement
        );
      } else if (ctx.itr.peek.v === 'in') {
        ctx.itr.read('in');
        const valueExpression = readExpression(ctx);
        ctx.itr.read(')');
        const statement = readStatement(ctx);

        return new ast.IterationStatement(
          'for-var-in',
          { variableDeclaration, valueExpression },
          statement
        );
      } else {
        throw new Error('Unexpected token: ' + ctx.itr.peek.v);
      }
    } else {
      //const leftHandSideExpression = readLeftHandSideExpression(ctx);
      const expression = readExpressionNoIn(ctx);
      if (ctx.itr.peek.v === ';') {
        const initializationExpression = expression;
        ctx.itr.read(';');
        const continueExpression = readExpression(ctx);
        ctx.itr.read(';');
        const finalExpression = readExpression(ctx);
        ctx.itr.read(')');
        const statement = readStatement(ctx);

        return new ast.IterationStatement(
          'for',
          { initializationExpression, continueExpression, finalExpression },
          statement
        );
      } else if (ctx.itr.peek.v === 'in') {
        leftHandSideExpression = expression;
        ctx.itr.read('in');
        const valueExpression = readExpression(ctx);
        ctx.itr.read(')');
        const statement = readStatement(ctx);

        return new ast.IterationStatement(
          'for-var-in',
          { leftHandSideExpression, valueExpression },
          statement
        );
      }
    }
  }

  throw new NotImplementedError('readIterationStatement ' + ctx.itr.peek.v);
}

function readEmptyStatement(ctx) {
  ctx.itr.read(';');
  return new ast.EmptyStatement([]);
}

// ReturnStatement	::=	"return" ( Expression )? ( ";" )?
function readReturnStatement(ctx) {
  dlog('readExpressionStatement');
  ctx.itr.read('return');
  let exp = undefined;
  if (ctx.itr.peek.v !== ';') {
    exp = readExpression(ctx);
  }
  skipSemi(ctx);
  return new ast.ReturnStatement(exp);
}

function readExpressionStatement(ctx) {
  dlog('readExpressionStatement');
  const exp = readExpression(ctx);
  skipSemi(ctx);
  return exp;
}

function readExpression(ctx) {
  dlog('readExpression');
  ctx.noIn.push(false);
  const assignmentExpression = readAssignmentExpression(ctx);
  ctx.noIn.pop();
  return assignmentExpression;
}

function readExpressionNoIn(ctx) {
  dlog('readExpressionNoIn');
  ctx.noIn.push(true);
  const assignmentExpression = readAssignmentExpression(ctx);
  ctx.noIn.pop();
  return assignmentExpression;
}

//AssignmentOperator	::=	( "=" | "*=" | "/=" | "%=" | "+=" | "-=" | "<<=" | ">>=" | ">>>=" | "&=" | "^=" | "|=" )
const assignmentOperators = Object.keys(ast.AssignmentOperator);
// AssignmentExpression	::=	( LeftHandSideExpression AssignmentOperator AssignmentExpression | ConditionalExpression )
function readAssignmentExpression(ctx) {
  dlog('readAssignmentExpression');
  const left = readConditionalExpression(ctx);

  if (assignmentOperators.includes(ctx.itr.peek.v)) {
    const operator = ctx.itr.read(assignmentOperators);
    const right = readAssignmentExpression(ctx);
    return new ast.AssignmentExpression(left, right, operator);
  }
  return left;
}

function readConditionalExpression(ctx) {
  dlog('readConditionalExpression');
  const left = readLogicalORExpression(ctx);
  if (ctx.itr.peek.v === '?')
    throw new Error('Not implemented: readConditionalExpression');
  return left;
}

const LogicalOrOperator = '||';
// LogicalANDExpression ( LogicalOROperator LogicalANDExpression )*
function readLogicalORExpression(ctx) {
  dlog('readLogicalORExpression');
  let child = readLogicalANDExpression(ctx);
  while (ctx.itr.peek.v === LogicalOrOperator) {
    ctx.itr.read(LogicalOrOperator);
    child = new ast.LogicalORExpression(child, readLogicalANDExpression(ctx));
  }
  return child;
}

const LogicalANDOperator = '&&';
// BitwiseORExpression ( LogicalANDOperator BitwiseORExpression )*
function readLogicalANDExpression(ctx) {
  dlog('readLogicalANDExpression');
  let child = readBitwiseORExpression(ctx);
  while (ctx.itr.peek.v === LogicalANDOperator) {
    ctx.itr.read(LogicalANDOperator);
    child = new ast.LogicalANDExpression(child, readBitwiseORExpression(ctx));
  }
  return child;
}

const BitwiseOROperator = '|';
// BitwiseORExpression	::=	BitwiseXORExpression ( BitwiseOROperator BitwiseXORExpression )*
function readBitwiseORExpression(ctx) {
  dlog('readBitwiseORExpression');
  let child = readBitwiseXORExpression(ctx);
  while (ctx.itr.peek.v === BitwiseOROperator) {
    ctx.itr.read(BitwiseOROperator);
    child = new ast.BitwiseORExpression(child, readBitwiseXORExpression(ctx));
  }
  return child;
}

const BitwiseXOROperator = '^';
// BitwiseXORExpression	::=	BitwiseANDExpression ( BitwiseXOROperator BitwiseANDExpression )*
function readBitwiseXORExpression(ctx) {
  dlog('readBitwiseXORExpression');
  let child = readBitwiseANDExpression(ctx);
  while (ctx.itr.peek.v === BitwiseXOROperator) {
    ctx.itr.read(BitwiseXOROperator);
    child = new ast.BitwiseXORExpression(child, readBitwiseANDExpression(ctx));
  }
  return child;
}

const BitwiseANDOperator = '&';
// BitwiseANDExpression	::=	EqualityExpression ( BitwiseANDOperator EqualityExpression )*
function readBitwiseANDExpression(ctx) {
  dlog('readBitwiseANDExpression');
  let child = readEqualityExpression(ctx);
  while (ctx.itr.peek.v === BitwiseANDOperator) {
    ctx.itr.read(BitwiseANDOperator);
    child = new ast.BitwiseANDExpression(child, readEqualityExpression(ctx));
  }
  return child;
}

const equalityOperators = Object.keys(ast.EqualityOperator);
// EqualityExpression	::=	RelationalExpression ( EqualityOperator RelationalExpression )*
function readEqualityExpression(ctx) {
  dlog('readEqualityExpression');
  let child = readRelationalExpression(ctx);
  while (equalityOperators.includes(ctx.itr.peek.v)) {
    const equalityOperator = ctx.itr.read(equalityOperators);
    child = new ast.EqualityExpression(
      child,
      readEqualityExpression(ctx),
      equalityOperator
    );
  }
  return child;
}

const relationalOperatorsWithIn = Object.keys(ast.RelationalOperator);
const relationalOperatorsNoIn = Object.keys(ast.RelationalOperator).filter(
  x => x !== 'in'
);
// RelationalExpression	::=	ShiftExpression ( RelationalOperator ShiftExpression )*
function readRelationalExpression(ctx) {
  dlog('readRelationalExpression');
  let child = readShiftExpression(ctx);

  const relationalOperators = ctx.noIn[0]
    ? relationalOperatorsNoIn
    : relationalOperatorsWithIn;

  while (relationalOperators.includes(ctx.itr.peek.v)) {
    const relationalOperator = ctx.itr.read(relationalOperators);
    child = new ast.RelationalExpression(
      child,
      readShiftExpression(ctx),
      relationalOperator
    );
  }
  return child;
}

const shiftOperators = Object.keys(ast.ShiftOperator);
// ShiftExpression	::=	AdditiveExpression ( ShiftOperator AdditiveExpression )*
function readShiftExpression(ctx) {
  dlog('readShiftExpression');
  let child = readAdditiveExpression(ctx);
  while (shiftOperators.includes(ctx.itr.peek.v)) {
    const shiftOperator = ctx.itr.read(shiftOperators);
    const right = readAdditiveExpression(ctx);
    child = new ast.ShiftExpression(child, right, shiftOperator);
  }
  return child;
}

const additiveOperators = Object.keys(ast.AdditiveOperator);
// AdditiveExpression	::=	MultiplicativeExpression ( AdditiveOperator MultiplicativeExpression )*
function readAdditiveExpression(ctx) {
  dlog('readAdditiveExpression');
  let child = readMultiplicativeExpression(ctx);
  while (additiveOperators.includes(ctx.itr.peek.v)) {
    const additiveOperator = ctx.itr.read(additiveOperators);
    const right = readMultiplicativeExpression(ctx);
    child = new ast.AdditiveExpression(child, right, additiveOperator);
  }
  return child;
}

const multiplicativeOperators = Object.keys(ast.MultiplicativeOperator);
// MultiplicativeExpression	::=	UnaryExpression ( MultiplicativeOperator UnaryExpression )*
function readMultiplicativeExpression(ctx) {
  dlog('readMultiplicativeExpression');
  let child = readUnaryExpression(ctx);
  while (multiplicativeOperators.includes(ctx.itr.peek.v)) {
    const multiplicativeOperator = ctx.itr.read(multiplicativeOperators);
    const right = readUnaryExpression(ctx);
    child = new ast.MultiplicativeExpression(
      child,
      right,
      multiplicativeOperator
    );
  }
  return child;
}

const unaryOperators = Object.keys(ast.UnaryOperator);
// UnaryExpression	::=	( PostfixExpression | ( UnaryOperator UnaryExpression )+ )
function readUnaryExpression(ctx) {
  dlog('readUnaryExpression');

  if (unaryOperators.includes(ctx.itr.peek.v)) {
    const unaryOperator = ctx.itr.read(unaryOperators);
    const unaryExpression = readUnaryExpression(ctx);
    return new ast.UnaryExpression(unaryOperator, unaryExpression);
  }
  return readPostfixExpression(ctx);
}

const postfixOperators = Object.keys(ast.PostfixOperator);
// PostfixExpression	::=	LeftHandSideExpression ( PostfixOperator )?
function readPostfixExpression(ctx) {
  dlog('readPostfixExpression');
  let leftHandSizeExpression = readLeftHandSideExpression(ctx);
  while (postfixOperators.includes(ctx.itr.peek.v)) {
    const postfixOperator = ctx.itr.read(postfixOperators);
    leftHandSizeExpression = new ast.PostfixExpression(
      leftHandSizeExpression,
      postfixOperator
    );
  }
  return leftHandSizeExpression;
}

// LeftHandSideExpression ::= CallExpression | MemberExpression
function readLeftHandSideExpression(ctx) {
  dlog('readLeftHandSideExpression');
  const memExp = readMemberExpression(ctx);

  if (ctx.itr.peek.v === '(') {
    const args = readArguments(ctx);
    return new ast.LeftHandSideExpression(new ast.CallExpression(memExp, args));
  }
  // return memExp;
  return new ast.LeftHandSideExpression(memExp);
}

// Arguments	::=	"(" ( ArgumentList )? ")"
function readArguments(ctx) {
  ctx.itr.read('(');
  let argList = [];
  if (ctx.itr.peek.v !== ')') {
    argList = [readArgumentList(ctx)];
  }
  ctx.itr.read(')');
  return new ast.Arguments(...argList);
}

// ArgumentList	::=	AssignmentExpression ( "," AssignmentExpression )*
function readArgumentList(ctx) {
  dlog('readArgumentList');
  const argumentList = [readAssignmentExpression(ctx)];
  while (ctx.itr.peek.v === ',') {
    ctx.itr.read(',');
    argumentList.push(readAssignmentExpression(ctx));
  }

  return new ast.ArgumentList(...argumentList);
}

function readMemberExpression(ctx) {
  dlog('readMemberExpression');
  // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* ) | AllocationExpression
  const expression = (() => {
    if (ctx.itr.peek.v === 'new') {
      return readAllocationExpression(ctx);
    }

    let child;
    if (ctx.itr.peek.v === 'function') {
      child = readFunctionExpression(ctx);
    } else {
      child = readPrimaryExpression(ctx);
    }
    while (ctx.itr.peek.v === '[' || ctx.itr.peek.v === '.') {
      child = readMemberExpressionPart(ctx, child);
    }
    return child;
  })();
  return new ast.MemberExpression(expression);
}

// MemberExpressionPart	::=	( "[" Expression "]" ) |	( "." Identifier )
function readMemberExpressionPart(ctx, target) {
  dlog('readMemberExpressionPart');
  if (ctx.itr.peek.v === '[') {
    ctx.itr.read('[');
    const expression = readExpression(ctx);
    ctx.itr.read(']');
    return new ast.MemberExpressionPart('[', expression, target);
  } else if (ctx.itr.peek.v === '.') {
    ctx.itr.read('.');
    const identifier = readIdentifier(ctx);
    return new ast.MemberExpressionPart('.', identifier, target);
  } else {
    throw new Error();
  }
}

function readPrimaryExpression(ctx) {
  dlog('readPrimaryExpression');
  const peek = ctx.itr.peek.v;
  if (peek === 'this') throw new NotImplementedError('this');
  if (peek === '{') return readObjectLiteral(ctx);
  if (peek === '[') return readArrayLiteral(ctx);
  if (peek === '(') {
    ctx.itr.read('(');
    const exp = readExpression(ctx);
    ctx.itr.read(')');
    return exp;
  }
  if (isLiteral(ctx)) return readLiteral(ctx);

  return readIdentifier(ctx);
}

function isLiteral(ctx) {
  return (
    (ctx.itr.peek.v === 'null') |
    (ctx.itr.peek.v === 'true') |
    (ctx.itr.peek.v === 'false') |
    (ctx.itr.peek.v === 'undefined') |
    (ctx.itr.peek.t === 'number') |
    (ctx.itr.peek.t === 'string')
  );
}

function readLiteral(ctx) {
  dlog('readLiteral');
  const literalAst = (() => {
    if (ctx.itr.peek.t === 'string') return readString(ctx);
    if (ctx.itr.peek.t === 'number') return readNumber(ctx);
    if (ctx.itr.peek.v === 'null') {
      ctx.itr.read('null');
      return new ast.Literal(null);
    }
    if (ctx.itr.peek.v === 'true') {
      ctx.itr.read('true');
      return new ast.Literal(true);
    }
    if (ctx.itr.peek.v === 'false') {
      ctx.itr.read('false');
      return new ast.Literal(false);
    }
    if (ctx.itr.peek.v === 'undefined') {
      ctx.itr.read('undefined');
      return new ast.Literal(undefined);
    }
  })();

  return literalAst;
}

function readNumber(ctx) {
  dlog('readNumber');
  const num = ctx.itr.read();
  return new ast.Literal(parseFloat(num));
}

function readString(ctx) {
  dlog('readString');
  const str = ctx.itr.read();
  return new ast.Literal(str);
}

// ArrayLiteral	::=	"[" ( ( Elision )? "]" | ElementList Elision "]" | ( ElementList )? "]" )
function readArrayLiteral(ctx) {
  dlog('readArrayLiteral');
  ctx.itr.read('[');

  const elementList =
    ctx.itr.peek.v === ']' ? new ast.ElementList([]) : readElementList(ctx);
  ctx.itr.read(']');
  return new ast.ArrayLiteral(elementList);
}

// ElementList	::=	( Elision )? AssignmentExpression ( Elision AssignmentExpression )*
function readElementList(ctx) {
  dlog('readElementList');
  const elements = [readAssignmentExpression(ctx)];
  while (ctx.itr.peek.v === ',') {
    ctx.itr.read(',');
    elements.push(readAssignmentExpression(ctx));
  }

  return new ast.ElementList(elements);
}

// ObjectLiteral	::=	"{" ( PropertyNameAndValueList )? "}"
function readObjectLiteral(ctx) {
  dlog('readObjectLiteral');
  ctx.itr.read('{');
  let values = null;
  if (ctx.itr.peek.v !== '}') {
    values = readPropertyNameAndValueList(ctx);
  }
  ctx.itr.read('}');

  return new ast.ObjectLiteral(values);
}

// PropertyNameAndValueList	::=	PropertyNameAndValue ( "," PropertyNameAndValue | "," )*
function readPropertyNameAndValueList(ctx) {
  dlog('readPropertyNameAndValueList');
  const elements = [readPropertyNameAndValue(ctx)];
  while (ctx.itr.peek.v === ',') {
    ctx.itr.read(',');
    elements.push(readPropertyNameAndValue(ctx));
  }

  return new ast.PropertyNameAndValueList(...elements);
}
// PropertyNameAndValue	::=	PropertyName ":" AssignmentExpression
function readPropertyNameAndValue(ctx) {
  dlog('readPropertyNameAndValue');
  const name = readPropertyName(ctx);
  ctx.itr.read(':');
  const value = readAssignmentExpression(ctx);
  return new ast.PropertyNameAndValue(name, value);
}

// PropertyName	::=	Identifier |	<STRING_LITERAL>	|	<DECIMAL_LITERAL>
function readPropertyName(ctx) {
  dlog('readPropertyName');
  if (ctx.itr.peek.t === 'string' || ctx.itr.peek.t === 'number') {
    return readLiteral(ctx);
  } else {
    return readIdentifier(ctx);
  }
}

function readAllocationExpression(ctx) {
  dlog('readAllocationExpression');
  throw new NotImplementedError('readAllocationExpression');
}

// VariableStatement	::=	"var" VariableDeclarationList ( ";" )?
function readVariableStatement(ctx) {
  dlog('readVariableStatement');
  ctx.itr.read('var');
  const child = readVariableDeclarationList(ctx);
  skipSemi(ctx);
  return new ast.VariableStatement(child);
}

// VariableDeclarationList	::=	VariableDeclaration ( "," VariableDeclaration )*
function readVariableDeclarationList(ctx) {
  dlog('readVariableDeclarationList');
  const variableDeclaration = readVariableDeclaration(ctx);
  if (ctx.itr.peek.v !== ',') {
    return variableDeclaration;
  }
  const variableDeclarations = [variableDeclaration];
  while (ctx.itr.peek.v === ',') {
    ctx.itr.read(',');
    variableDeclarations.push(readVariableDeclaration(ctx));
  }
  return new ast.VariableDeclarationList(variableDeclarations);
}

// VariableDeclaration	::=	Identifier ( Initialiser )?
function readVariableDeclaration(ctx) {
  dlog('readVariableDeclaration');
  const identifier = readIdentifier(ctx);
  const initialiser = ctx.itr.peek.v === '=' ? readInitialiser(ctx) : null;
  return new ast.VariableDeclaration(identifier, initialiser);
}

// Identifier	::=	<IDENTIFIER_NAME>
function readIdentifier(ctx) {
  dlog('readIdentifier');
  const { value } = ctx.itr.next();
  if (value.t !== 'identifier')
    throw new Error(
      'readIdentifier Expected identifier, got:' + JSON.stringify(value)
    );
  return new ast.Identifier(value.v);
}

function readInitialiser(ctx) {
  dlog('readInitialiser');
  ctx.itr.read('=');

  return readAssignmentExpression(ctx);
}

module.exports = {
  readProgram
};
