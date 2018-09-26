const ast = require('./ast');

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

  const elements = readSourceElements(ctx);
  return new ast.Program([elements]);
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
  let params = [];
  if (ctx.itr.peek.v !== ')') {
    params = readFormalParameterList(ctx);
  }
  ctx.itr.read(')');
  const body = readFunctionBody(ctx);

  return { identifier, params, body };
}

function readFormalParameterList(ctx) {
  // Identifier ( "," Identifier )*
  dlog('readFormalParameterList');
  throw new NotImplementedError('readFormalParameterList');
}

function readFunctionBody(ctx) {
  // "{" ( SourceElements )? "}"
  dlog('readFunctionBody');
  ctx.itr.read('{');
  let sourceElements = [];
  if (ctx.itr.peek.v !== '}') {
    sourceElements = readSourceElements(ctx);
  }
  ctx.itr.read('}');
  return new ast.FunctionBody([sourceElements]);
  // throw new NotImplementedError('readFunctionBody');
}

function readStatementList(ctx) {
  dlog('readStatementList');
  return readStatement(ctx);
}

function readStatement(ctx) {
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
  dlog('readStatement');
  skipEmptyLines(ctx);
  const peek = ctx.itr.peek.v;
  dlog('peek:', peek);
  if (peek === ';') {
    return readEmptyStatement(ctx);
  } else if (peek === 'var') {
    return readVarStatement(ctx);
  } else if (peek === 'return') {
    return readReturnStatement(ctx);
  } else {
    return readExpressionStatement(ctx);
  }
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
  return readAssignmentExpression(ctx);
}

function readAssignmentExpression(ctx) {
  dlog('readAssignmentExpression');
  return readConditionalExpression(ctx);
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

const relationalOperators = Object.keys(ast.RelationalOperator);
// RelationalExpression	::=	ShiftExpression ( RelationalOperator ShiftExpression )*
function readRelationalExpression(ctx) {
  dlog('readRelationalExpression');
  let child = readShiftExpression(ctx);
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

const unaryOperators = [
  'delete',
  'void',
  'typeof',
  '++',
  '--',
  '+',
  '-',
  '~',
  '!'
];
function readUnaryExpression(ctx) {
  dlog('readUnaryExpression');

  while (unaryOperators.includes(ctx.itr.peek.v)) {
    throw new NotImplementedError('unaryOperator: ' + unaryOperator);
    const unaryOperator = ctx.itr.read(unaryOperators);
  }
  let child = readPostfixExpression(ctx);

  return child;
}

const postfixOperators = ['++', '--'];
function readPostfixExpression(ctx) {
  dlog('readPostfixExpression');
  let child = readLeftHandSideExpression(ctx);
  while (postfixOperators.includes(ctx.itr.peek.v)) {
    throw new NotImplementedError(ctx.itr.peek.v);
  }
  return child;
}

// LeftHandSideExpression ::= CallExpression | MemberExpression

function readLeftHandSideExpression(ctx) {
  dlog('readLeftHandSideExpression');
  const memExp = readMemberExpression(ctx);

  if (ctx.itr.peek.v === '(') {
    const args = readArguments(ctx);
    return new ast.CallExpression(memExp, args);
  }
  return memExp;
  throw new NotImplementedError('CallExpression');
}

// Arguments	::=	"(" ( ArgumentList )? ")"
function readArguments(ctx) {
  ctx.itr.read('(');
  let argList = [];
  if (ctx.itr.peek.v !== ')') {
    argList = [readArgumentList(ctx)];
  }
  ctx.itr.read(')');
  return new ast.Arguments(argList);
}

// ArgumentList	::=	AssignmentExpression ( "," AssignmentExpression )*
function readArgumentList(ctx) {
  throw new NotImplementedError('readArgumentList');
}

function readMemberExpression(ctx) {
  dlog('readMemberExpression');
  // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* ) | AllocationExpression

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

  return new ast.PropertyNameAndValueList(elements);
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

function readVarStatement(ctx) {
  dlog('readVarStatement');
  ctx.itr.read('var');
  const varDecList = readVarDeclarationList(ctx);
  skipSemi(ctx);
  return new ast.VarStatement(varDecList);
}

// VariableDeclarationList	::=	VariableDeclaration ( "," VariableDeclaration )*
function readVarDeclarationList(ctx) {
  dlog('readVarDeclarationList');
  const varDecList = [readVarDeclaration(ctx)];
  while (ctx.itr.peek.v === ',') {
    ctx.itr.read(',');
    varDecList.push(readVarDeclaration(ctx));
  }
  return varDecList;
}

function readVarDeclaration(ctx) {
  dlog('readVarDeclaration');
  const identifier = readIdentifier(ctx);
  const initialiser = ctx.itr.peek.v === '=' ? readInitialiser(ctx) : undefined;
  return new ast.VarDeclaration(identifier, initialiser);
}

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