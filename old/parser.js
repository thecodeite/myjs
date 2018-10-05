const ast = require('../ast/ast');
const NotImplementedError = require('../NotImplementedError');

// // SourceElements ::= ( SourceElement )+
// function readSourceElements(ctx) {
//   ctx.dlog('readSourceElements');

//   const sourceElements = [];
//   while (!ctx.itr.done && ctx.itr.peek.v !== '}') {
//     ctx.dlog('-----------------------------------------');
//     sourceElements.push(readSourceElement(ctx));
//     ctx.skipEmptyLines(ctx);
//   }
//   return new ast.SourceElements(sourceElements);
// }

// // SourceElement	::=	FunctionDeclaration |	Statement
// function readSourceElement(ctx) {
//   ctx.skipEmptyLines(ctx);
//   ctx.dlog('readSourceElement', ctx.itr.peek.v);

//   if (ctx.itr.peek.v === 'function') {
//     return readFunctionDeclaration(ctx);
//   } else {
//     return readStatement(ctx);
//   }
// }

// // FunctionExpression	::=	"function" ( Identifier )? ( "(" ( FormalParameterList )? ")" ) FunctionBody
// function readFunctionExpression(ctx) {
//   const {
//     identifier,
//     params,
//     body
//   } = readFunctionDeclarationOrFunctionExpression(ctx, false);
//   return new ast.FunctionExpression(identifier, params, body);
// }

// // FunctionDeclaration	::=	 "function" Identifier ( "(" ( FormalParameterList )? ")" ) FunctionBody
// function readFunctionDeclaration(ctx) {
//   const {
//     identifier,
//     params,
//     body
//   } = readFunctionDeclarationOrFunctionExpression(ctx, true);
//   return new ast.FunctionDeclaration(identifier, params, body);
// }

// module.exports.readFunctionDeclarationOrFunctionExpression = readFunctionDeclarationOrFunctionExpression;
// function readFunctionDeclarationOrFunctionExpression(ctx, identifierRequired) {
//   ctx.dlog('readFunctionDeclaration');
//   ctx.itr.read('function');
//   let identifier = null;
//   if (ctx.itr.peek.v === '(') {
//     if (identifierRequired) {
//       throw new Error('Identifier expected');
//     }
//   } else {
//     identifier = readIdentifier(ctx);
//   }
//   ctx.itr.read('(');
//   let params = new ast.FormalParameterList([]);
//   if (ctx.itr.peek.v !== ')') {
//     params = readFormalParameterList(ctx);
//   }
//   ctx.itr.read(')');
//   const body = readFunctionBody(ctx);

//   return { identifier, params, body };
// }

// // FormalParameterList ::= Identifier ( "," Identifier )*
// module.exports.readFormalParameterList = readFormalParameterList;
// function readFormalParameterList(ctx) {
//   ctx.dlog('readFormalParameterList');
//   const identifiers = [readIdentifier(ctx)];
//   while (ctx.itr.peek.v === ',') {
//     ctx.itr.read(',');
//     identifiers.push(readIdentifier(ctx));
//   }

//   return new ast.FormalParameterList(identifiers);
// }

// module.exports.readFunctionBody = readFunctionBody;
// function readFunctionBody(ctx) {
//   // "{" ( SourceElements )? "}"
//   ctx.dlog('readFunctionBody');
//   ctx.itr.read('{');
//   let sourceElements = new (require('../ast/SourceElements')).SourceElements(
//     []
//   );
//   if (ctx.itr.peek.v !== '}') {
//     sourceElements = require('../ast/SourceElements').SourceElements.read(ctx);
//   }
//   ctx.itr.read('}');
//   return new ast.FunctionBody(sourceElements);
// }

// StatementList	::=	( Statement )+
const readStatementList = ast.StatementList.read;
module.exports.readStatementList = readStatementList;
// function readStatementList(ctx, terminators) {
//   ctx.dlog('readStatementList');
//   const statements = [];

//   while (!terminators.includes(ctx.itr.peek.v)) {
//     statements.push(readStatement(ctx));
//     ctx.skipEmptyLines(ctx);
//   }

//   return new ast.StatementList(statements);
// }

// const idStatements = {
//   return: readReturnStatement,
//   var: readVariableStatement,
//   do: readIterationStatement,
//   while: readIterationStatement,
//   for: readIterationStatement,
//   if: readIfStatement,
//   continue: readContinue,
//   break: readBreak,
//   import: () => {
//     throw new NotImplementedError('readStatement: import');
//   },
//   with: () => {
//     throw new NotImplementedError('readStatement: with');
//   },
//   switch: readSwitchStatement,
//   throw: readThrowStatement,
//   try: readTryStatement
// };
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
const readStatement = ast.Statement.read;
module.exports.readStatement = readStatement;
// function readStatement(ctx) {
//   ctx.dlog('readStatement');
//   ctx.skipEmptyLines(ctx);
//   const peek = ctx.itr.peek.v;
//   ctx.dlog('peek:', peek);

//   if (peek === ';') {
//     return readEmptyStatement(ctx);
//   } else if (peek === '{') {
//     return readBlock(ctx);
//   } else if (idStatements[peek]) {
//     return idStatements[peek](ctx);
//   } else {
//     return readExpressionStatement(ctx);
//   }
// }

// ThrowStatement	::=	"throw" Expression ( ";" )?
const readThrowStatement = ast.ThrowStatement.read;
module.exports.readThrowStatement = readThrowStatement;
// function readThrowStatement(ctx) {
//   ctx.dlog('readTryStatement');
//   ctx.itr.read('throw');
//   const expression = readExpression(ctx);
//   ctx.skipSemi(ctx);
//   return new ast.ThrowStatement(expression);
// }

const readTryStatement = ast.TryStatement.read;
module.exports.readTryStatement = readTryStatement;
// TryStatement	::=	"try" Block ( ( Finally | Catch ( Finally )? ) )
// function readTryStatement(ctx) {
//   ctx.dlog('readTryStatement');
//   ctx.itr.read('try');
//   const block = readBlock(ctx);
//   let catchBlock, finallyBlock;
//   if (ctx.itr.peek.v === 'finally') {
//     finallyBlock = readFinally(ctx);
//   } else {
//     catchBlock = readCatch(ctx);
//     if (ctx.itr.peek.v === 'finally') {
//       finallyBlock = readFinally(ctx);
//     }
//   }
//   return new ast.TryStatement(block, catchBlock, finallyBlock);
// }

const readCatch = ast.Catch.read;
module.exports.readCatch = readCatch;
// // Catch	::=	"catch" "(" Identifier ")" Block
// function readCatch(ctx) {
//   ctx.dlog('readCatch');

//   ctx.itr.read('catch');
//   ctx.itr.read('(');
//   const identifier = readIdentifier(ctx);
//   ctx.itr.read(')');
//   const block = readBlock(ctx);
//   return new ast.Catch(identifier, block);
// }

const readFinally = ast.Finally.read;
module.exports.readFinally = readFinally;
// // Finally	::=	"finally" Block
// function readFinally(ctx) {
//   ctx.dlog('readFinally');

//   ctx.itr.read('finally');
//   const block = readBlock(ctx);
//   return new ast.Finally(block);
// }

const readSwitchStatement = ast.SwitchStatement.read;
module.exports.readSwitchStatement = readSwitchStatement;
// // SwitchStatement	::=	"switch" "(" Expression ")" CaseBlock
// function readSwitchStatement(ctx) {
//   ctx.dlog('readSwitchStatement');
//   ctx.itr.read('switch');
//   ctx.itr.read('(');
//   const expression = readExpression(ctx);
//   ctx.itr.read(')');
//   const caseBlock = readCaseBlock(ctx);

//   return new ast.SwitchStatement(expression, caseBlock);
// }

const readCaseBlock = ast.CaseBlock.read;
module.exports.readCaseBlock = readCaseBlock;
// // CaseBlock	::=	"{" ( CaseClauses )? ( "}" | DefaultClause ( CaseClauses )? "}" )
// function readCaseBlock(ctx) {
//   ctx.dlog('readCaseBlock');
//   ctx.itr.read('{');

//   const clausesA = [...readCaseClauses(ctx)];
//   let defaultClause = [];
//   let clausesB = [];
//   if (ctx.itr.peek.v !== '}') {
//     defaultClause = [...readDefaultClause(ctx)];
//     clausesB = [...readCaseClauses(ctx)];
//   }

//   ctx.skipEmptyLines(ctx);
//   ctx.itr.read('}');
//   const clauses = [...clausesA, ...defaultClause, ...clausesB];
//   return new ast.CaseBlock(clauses);
// }

const readCaseClauses = ast.CaseClauses.read;
module.exports.readCaseClauses = readCaseClauses;
// // CaseClauses	::=	( CaseClause )+
// function* readCaseClauses(ctx) {
//   ctx.dlog('readCaseClauses');
//   ctx.skipEmptyLines(ctx);
//   while (ctx.itr.peek.v === 'case') {
//     yield readCaseClause(ctx);
//     ctx.skipEmptyLines(ctx);
//   }
// }

const readCaseClause = ast.CaseClause.read;
module.exports.readCaseClause = readCaseClause;
// // CaseClause	::=	( ( "case" Expression ":" ) ) ( StatementList )?
// function readCaseClause(ctx) {
//   ctx.dlog('readCaseClause');
//   ctx.itr.read('case');
//   const expression = readExpression(ctx);
//   ctx.itr.read(':');
//   const statementList = readStatementList(ctx, ['case', 'default', '}']);
//   return new ast.CaseClause(expression, statementList);
// }

const readDefaultClause = ast.DefaultClause.read;
module.exports.readDefaultClause = readDefaultClause;
// // DefaultClause	::=	( ( "default" ":" ) ) ( StatementList )?
// function* readDefaultClause(ctx) {
//   ctx.dlog('readDefaultClause');
//   if (ctx.itr.peek.v !== 'default') return;
//   ctx.itr.read('default');
//   ctx.itr.read(':');
//   const statementList = readStatementList(ctx, ['case', 'default', '}']);

//   yield new ast.DefaultClause(statementList);
// }

const readContinue = ast.ContinueStatement.read;
module.exports.readContinue = readContinue;
// // ContinueStatement	::=	"continue" ( Identifier )? ( ";" )?
// function readContinue(ctx) {
//   ctx.dlog('readContinue');
//   ctx.itr.read('continue');

//   let identifier = null;
//   if (ctx.itr.peek.t === 'identifier') {
//     throw new NotImplementedError('readContinue named continue');
//     identifier = readIdentifier(ctx);
//   }

//   ctx.skipSemi(ctx);
//   return new ast.ContinueStatement(identifier);
// }

const readBreak = ast.BreakStatement.read;
module.exports.readBreak = readBreak;
// // BreakStatement	::=	"break" ( Identifier )? ( ";" )?
// function readBreak(ctx) {
//   ctx.dlog('readBreak');
//   ctx.itr.read('break');

//   let identifier = null;
//   if (ctx.itr.peek.t === 'identifier') {
//     throw new NotImplementedError('readBreak named break');
//     identifier = readIdentifier(ctx);
//   }

//   ctx.skipSemi(ctx);
//   return new ast.BreakStatement(identifier);
// }

const readIfStatement = ast.IfStatement.read;
module.exports.readIfStatement = readIfStatement;
// // IfStatement	::=	"if" "(" Expression ")" Statement ( "else" Statement )?
// function readIfStatement(ctx) {
//   ctx.dlog('readIfStatement');
//   ctx.itr.read('if');
//   ctx.itr.read('(');
//   const expression = readExpression(ctx);
//   ctx.itr.read(')');
//   const statement = readStatement(ctx);

//   let elseStatement;
//   if (ctx.itr.peek.v === 'else') {
//     ctx.itr.read('else');
//     elseStatement = readStatement(ctx);
//   }

//   return new ast.IfStatement(expression, statement, elseStatement);
// }

const readBlock = ast.Block.read;
module.exports.readBlock = readBlock;
// // Block	::=	"{" ( StatementList )? "}"
// function readBlock(ctx) {
//   ctx.dlog('readBlock');
//   ctx.itr.read('{');
//   const statementList = readStatementList(ctx, ['}']);
//   ctx.itr.read('}');

//   return new ast.Block(statementList);
// }

const readIterationStatement = ast.IterationStatement.read;
module.exports.readIterationStatement = readIterationStatement;
// /*
// IterationStatement	::=	( "do" Statement "while" "(" Expression ")" ( ";" )? )
// |	( "while" "(" Expression ")" Statement )
// |	( "for" "(" ( ExpressionNoIn )? ";" ( Expression )? ";" ( Expression )? ")" Statement )
// |	( "for" "(" "var" VariableDeclarationList ";" ( Expression )? ";" ( Expression )? ")" Statement )
// |	( "for" "(" "var" VariableDeclarationNoIn "in" Expression ")" Statement )
// |	( "for" "(" LeftHandSideExpressionForIn "in" Expression ")" Statement )
// */
// function readIterationStatement(ctx) {
//   ctx.dlog('readIterationStatement');
//   if (ctx.itr.peek.v === 'while') {
//     ctx.itr.read('while');
//     ctx.itr.read('(');
//     const continueExpression = readExpression(ctx);
//     ctx.itr.read(')');
//     const statement = readStatement(ctx);
//     ctx.skipSemi(ctx);
//     return new ast.IterationStatement(
//       'while',
//       { continueExpression },
//       statement
//     );
//   }

//   if (ctx.itr.peek.v === 'do') {
//     ctx.itr.read('do');

//     const statement = readStatement(ctx);
//     ctx.itr.read('while');
//     ctx.itr.read('(');
//     const continueExpression = readExpression(ctx);
//     ctx.itr.read(')');
//     ctx.skipSemi(ctx);
//     return new ast.IterationStatement(
//       'do-while',
//       { initialExpression: ast.Literal.True, continueExpression },
//       statement
//     );
//   }

//   if (ctx.itr.peek.v === 'for') {
//     ctx.itr.read('for');
//     ctx.itr.read('(');

//     if (ctx.itr.peek.v === 'var') {
//       ctx.itr.read('var');
//       const variableDeclaration = readVariableDeclarationList(ctx);
//       if (ctx.itr.peek.v === ';') {
//         ctx.itr.read(';');
//         const continueExpression = readExpression(ctx);
//         ctx.itr.read(';');
//         const finalExpression = readExpression(ctx);
//         ctx.itr.read(')');
//         const statement = readStatement(ctx);

//         return new ast.IterationStatement(
//           'for-var',
//           { variableDeclaration, continueExpression, finalExpression },
//           statement
//         );
//       } else if (ctx.itr.peek.v === 'in') {
//         ctx.itr.read('in');
//         const valueExpression = readExpression(ctx);
//         ctx.itr.read(')');
//         const statement = readStatement(ctx);

//         return new ast.IterationStatement(
//           'for-var-in',
//           { variableDeclaration, valueExpression },
//           statement
//         );
//       } else {
//         throw new Error('Unexpected token: ' + ctx.itr.peek.v);
//       }
//     } else {
//       //const leftHandSideExpression = readLeftHandSideExpression(ctx);
//       const expression = readExpressionNoIn(ctx);
//       if (ctx.itr.peek.v === ';') {
//         const initializationExpression = expression;
//         ctx.itr.read(';');
//         const continueExpression = readExpression(ctx);
//         ctx.itr.read(';');
//         const finalExpression = readExpression(ctx);
//         ctx.itr.read(')');
//         const statement = readStatement(ctx);

//         return new ast.IterationStatement(
//           'for',
//           { initializationExpression, continueExpression, finalExpression },
//           statement
//         );
//       } else if (ctx.itr.peek.v === 'in') {
//         leftHandSideExpression = expression;
//         ctx.itr.read('in');
//         const valueExpression = readExpression(ctx);
//         ctx.itr.read(')');
//         const statement = readStatement(ctx);

//         return new ast.IterationStatement(
//           'for-var-in',
//           { leftHandSideExpression, valueExpression },
//           statement
//         );
//       }
//     }
//   }

//   throw new NotImplementedError('readIterationStatement ' + ctx.itr.peek.v);
// }

const readEmptyStatement = ast.EmptyStatement.read;
module.exports.readEmptyStatement = readEmptyStatement;
// // EmptyStatement	::=	";"
// function readEmptyStatement(ctx) {
//   ctx.itr.read(';');
//   return new ast.EmptyStatement([]);
// }

const readReturnStatement = ast.ReturnStatement.read;
module.exports.readReturnStatement = readReturnStatement;
// // ReturnStatement	::=	"return" ( Expression )? ( ";" )?
// function readReturnStatement(ctx) {
//   ctx.dlog('readExpressionStatement');
//   ctx.itr.read('return');
//   let exp = undefined;
//   if (ctx.itr.peek.v !== ';') {
//     exp = readExpression(ctx);
//   }
//   ctx.skipSemi(ctx);
//   return new ast.ReturnStatement(exp);
// }

const readExpressionStatement = ast.ExpressionStatement.read;
module.exports.readExpressionStatement = readExpressionStatement;
// // ExpressionStatement	::=	Expression ( ";" )?
// function readExpressionStatement(ctx) {
//   ctx.dlog('readExpressionStatement');
//   const exp = readExpression(ctx);
//   ctx.skipSemi(ctx);
//   return exp;
// }

const readExpression = ast.Expression.read;
module.exports.readExpression = readExpression;
// // Expression	::=	AssignmentExpression ( "," AssignmentExpression )*
// function readExpression(ctx) {
//   ctx.dlog('readExpression');
//   ctx.noIn.push(false);
//   const assignmentExpression = readAssignmentExpression(ctx);
//   ctx.noIn.pop();
//   return assignmentExpression;
// }

const readExpressionNoIn = ast.Expression.readNoIn;
module.exports.readExpressionNoIn = readExpressionNoIn;
// function readExpressionNoIn(ctx) {
//   ctx.dlog('readExpressionNoIn');
//   ctx.noIn.push(true);
//   const assignmentExpression = readAssignmentExpression(ctx);
//   ctx.noIn.pop();
//   return assignmentExpression;
// }

const readAssignmentExpression = ast.AssignmentExpression.read;
module.exports.readAssignmentExpression = readAssignmentExpression;
// // AssignmentExpression	::=	( LeftHandSideExpression AssignmentOperator AssignmentExpression | ConditionalExpression )
// function readAssignmentExpression(ctx) {
//   ctx.dlog('readAssignmentExpression');
//   const left = readConditionalExpression(ctx);

//   if (assignmentOperators.includes(ctx.itr.peek.v)) {
//     const operator = ctx.itr.read(assignmentOperators);
//     const right = readAssignmentExpression(ctx);
//     return new ast.AssignmentExpression(left, right, operator);
//   }
//   return left;
// }

const readConditionalExpression = ast.ConditionalExpression.read;
module.exports.readConditionalExpression = readConditionalExpression;
// // ConditionalExpression	::=	LogicalORExpression ( "?" AssignmentExpression ":" AssignmentExpression )?
// function readConditionalExpression(ctx) {
//   ctx.dlog('readConditionalExpression');
//   const left = readLogicalORExpression(ctx);
//   if (ctx.itr.peek.v === '?')
//     throw new Error('Not implemented: readConditionalExpression');
//   return left;
// }

const readLogicalORExpression = ast.LogicalORExpression.read;
module.exports.readLogicalORExpression = readLogicalORExpression;
// // LogicalORExpression	::=	LogicalANDExpression ( LogicalOROperator LogicalANDExpression )*
// function readLogicalORExpression(ctx) {
//   ctx.dlog('readLogicalORExpression');
//   let child = readLogicalANDExpression(ctx);
//   while (ctx.itr.peek.v === ast.LogicalOrOperator) {
//     ctx.itr.read(ast.LogicalOrOperator);
//     child = new ast.LogicalORExpression(child, readLogicalANDExpression(ctx));
//   }
//   return child;
// }

const readLogicalANDExpression = ast.LogicalANDExpression.read;
module.exports.readLogicalANDExpression = readLogicalANDExpression;
// BitwiseORExpression ( LogicalANDOperator BitwiseORExpression )*
// function readLogicalANDExpression(ctx) {
//   ctx.dlog('readLogicalANDExpression');
//   let child = readBitwiseORExpression(ctx);
//   while (ctx.itr.peek.v === as.LogicalANDOperator) {
//     ctx.itr.read(ast.LogicalANDOperator);
//     child = new ast.LogicalANDExpression(child, readBitwiseORExpression(ctx));
//   }
//   return child;
// }

const readBitwiseORExpression = ast.BitwiseORExpression.read;
module.exports.readBitwiseORExpression = readBitwiseORExpression;
// // BitwiseORExpression	::=	BitwiseXORExpression ( BitwiseOROperator BitwiseXORExpression )*
// function readBitwiseORExpression(ctx) {
//   ctx.dlog('readBitwiseORExpression');
//   let child = readBitwiseXORExpression(ctx);
//   while (ctx.itr.peek.v === ast.BitwiseOROperator) {
//     ctx.itr.read(ast.BitwiseOROperator);
//     child = new ast.BitwiseORExpression(child, readBitwiseXORExpression(ctx));
//   }
//   return child;
// }

const readBitwiseXORExpression = ast.BitwiseXORExpression.read;
module.exports.readBitwiseXORExpression = readBitwiseXORExpression;
// BitwiseXORExpression	::=	BitwiseANDExpression ( BitwiseXOROperator BitwiseANDExpression )*
// function readBitwiseXORExpression(ctx) {
//   ctx.dlog('readBitwiseXORExpression');
//   let child = readBitwiseANDExpression(ctx);
//   while (ctx.itr.peek.v === ast.BitwiseXOROperator) {
//     ctx.itr.read(ast.BitwiseXOROperator);
//     child = new ast.BitwiseXORExpression(child, readBitwiseANDExpression(ctx));
//   }
//   return child;
// }

const readBitwiseANDExpression = ast.BitwiseANDExpression.read;
module.exports.readBitwiseANDExpression = readBitwiseANDExpression;
// // BitwiseANDExpression	::=	EqualityExpression ( BitwiseANDOperator EqualityExpression )*
// function readBitwiseANDExpression(ctx) {
//   ctx.dlog('readBitwiseANDExpression');
//   let child = readEqualityExpression(ctx);
//   while (ctx.itr.peek.v === ast.BitwiseANDOperator) {
//     ctx.itr.read(ast.BitwiseANDOperator);
//     child = new ast.BitwiseANDExpression(child, readEqualityExpression(ctx));
//   }
//   return child;
// }

const readEqualityExpression = ast.EqualityExpression.read;
module.exports.readEqualityExpression = readEqualityExpression;
// const equalityOperators = Object.keys(ast.EqualityOperator);
// EqualityExpression	::=	RelationalExpression ( EqualityOperator RelationalExpression )*
// function readEqualityExpression(ctx) {
//   ctx.dlog('readEqualityExpression');
//   let child = readRelationalExpression(ctx);
//   while (equalityOperators.includes(ctx.itr.peek.v)) {
//     const equalityOperator = ctx.itr.read(equalityOperators);
//     child = new ast.EqualityExpression(
//       child,
//       readEqualityExpression(ctx),
//       equalityOperator
//     );
//   }
//   return child;
// }

// const relationalOperatorsWithIn = Object.keys(ast.RelationalOperator);
// const relationalOperatorsNoIn = Object.keys(ast.RelationalOperator).filter(
//   x => x !== 'in'
// );
const readRelationalExpression = ast.RelationalExpression.read;
module.exports.readRelationalExpression = readRelationalExpression;
// // RelationalExpression	::=	ShiftExpression ( RelationalOperator ShiftExpression )*
// function readRelationalExpression(ctx) {
//   ctx.dlog('readRelationalExpression');
//   let child = readShiftExpression(ctx);

//   const relationalOperators = ctx.noIn[0]
//     ? relationalOperatorsNoIn
//     : relationalOperatorsWithIn;

//   while (relationalOperators.includes(ctx.itr.peek.v)) {
//     const relationalOperator = ctx.itr.read(relationalOperators);
//     child = new ast.RelationalExpression(
//       child,
//       readShiftExpression(ctx),
//       relationalOperator
//     );
//   }
//   return child;
// }

const readShiftExpression = ast.ShiftExpression.read;
module.exports.readShiftExpression = readShiftExpression;
// const shiftOperators = Object.keys(ast.ShiftOperator);
// // ShiftExpression	::=	AdditiveExpression ( ShiftOperator AdditiveExpression )*
// function readShiftExpression(ctx) {
//   ctx.dlog('readShiftExpression');
//   let child = readAdditiveExpression(ctx);
//   while (shiftOperators.includes(ctx.itr.peek.v)) {
//     const shiftOperator = ctx.itr.read(shiftOperators);
//     const right = readAdditiveExpression(ctx);
//     child = new ast.ShiftExpression(child, right, shiftOperator);
//   }
//   return child;
// }

const readAdditiveExpression = ast.AdditiveExpression.read;
module.exports.readAdditiveExpression = readAdditiveExpression;
// const additiveOperators = Object.keys(ast.AdditiveOperator);
// // AdditiveExpression	::=	MultiplicativeExpression ( AdditiveOperator MultiplicativeExpression )*
// function readAdditiveExpression(ctx) {
//   ctx.dlog('readAdditiveExpression');
//   let child = readMultiplicativeExpression(ctx);
//   while (additiveOperators.includes(ctx.itr.peek.v)) {
//     const additiveOperator = ctx.itr.read(additiveOperators);
//     const right = readMultiplicativeExpression(ctx);
//     child = new ast.AdditiveExpression(child, right, additiveOperator);
//   }
//   return child;
// }

const readMultiplicativeExpression = ast.MultiplicativeExpression.read;
module.exports.readMultiplicativeExpression = readMultiplicativeExpression;
// const multiplicativeOperators = Object.keys(ast.MultiplicativeOperator);
// // MultiplicativeExpression	::=	UnaryExpression ( MultiplicativeOperator UnaryExpression )*
// function readMultiplicativeExpression(ctx) {
//   ctx.dlog('readMultiplicativeExpression');
//   let child = readUnaryExpression(ctx);
//   while (multiplicativeOperators.includes(ctx.itr.peek.v)) {
//     const multiplicativeOperator = ctx.itr.read(multiplicativeOperators);
//     const right = readUnaryExpression(ctx);
//     child = new ast.MultiplicativeExpression(
//       child,
//       right,
//       multiplicativeOperator
//     );
//   }
//   return child;
//}

const readUnaryExpression = ast.UnaryExpression.read;
module.exports.readUnaryExpression = readUnaryExpression;
//const unaryOperators = Object.keys(ast.UnaryOperator);
// // UnaryExpression	::=	( PostfixExpression | ( UnaryOperator UnaryExpression )+ )
// function readUnaryExpression(ctx) {
//   ctx.dlog('readUnaryExpression');

//   if (unaryOperators.includes(ctx.itr.peek.v)) {
//     const unaryOperator = ctx.itr.read(unaryOperators);
//     const unaryExpression = readUnaryExpression(ctx);
//     return new ast.UnaryExpression(unaryOperator, unaryExpression);
//   }
//   return readPostfixExpression(ctx);
// }

const readPostfixExpression = ast.PostfixExpression.read;
module.exports.readPostfixExpression = readPostfixExpression;
// const postfixOperators = Object.keys(ast.PostfixOperator);
// // PostfixExpression	::=	LeftHandSideExpression ( PostfixOperator )?
// function readPostfixExpression(ctx) {
//   ctx.dlog('readPostfixExpression');
//   let leftHandSizeExpression = readLeftHandSideExpression(ctx);
//   while (postfixOperators.includes(ctx.itr.peek.v)) {
//     const postfixOperator = ctx.itr.read(postfixOperators);
//     leftHandSizeExpression = new ast.PostfixExpression(
//       leftHandSizeExpression,
//       postfixOperator
//     );
//   }
//   return leftHandSizeExpression;
// }

const readLeftHandSideExpression = ast.LeftHandSideExpression.read;
module.exports.readLeftHandSideExpression = readLeftHandSideExpression;
// // LeftHandSideExpression ::= CallExpression | MemberExpression
// function readLeftHandSideExpression(ctx) {
//   ctx.dlog('readLeftHandSideExpression');
//   const memExp = readMemberExpression(ctx);

//   if (ctx.itr.peek.v === '(') {
//     const args = readArguments(ctx);
//     return new ast.LeftHandSideExpression(new ast.CallExpression(memExp, args));
//   }
//   // return memExp;
//   return new ast.LeftHandSideExpression(memExp);
// }

const readArguments = ast.Arguments.read;
module.exports.readArguments = readArguments;
// // Arguments	::=	"(" ( ArgumentList )? ")"
// function readArguments(ctx) {
//   ctx.itr.read('(');
//   let argList = [];
//   if (ctx.itr.peek.v !== ')') {
//     argList = [readArgumentList(ctx)];
//   }
//   ctx.itr.read(')');
//   return new ast.Arguments(...argList);
// }

const readArgumentList = ast.ArgumentList.read;
module.exports.readArgumentList = readArgumentList;
// // ArgumentList	::=	AssignmentExpression ( "," AssignmentExpression )*
// function readArgumentList(ctx) {
//   ctx.dlog('readArgumentList');
//   const argumentList = [readAssignmentExpression(ctx)];
//   while (ctx.itr.peek.v === ',') {
//     ctx.itr.read(',');
//     argumentList.push(readAssignmentExpression(ctx));
//   }

//   return new ast.ArgumentList(...argumentList);
// }

const readMemberExpression = ast.MemberExpression.read;
module.exports.readMemberExpression = readMemberExpression;
// // MemberExpression	::=
// // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* )
// // |	AllocationExpression
// function readMemberExpression(ctx) {
//   ctx.dlog('readMemberExpression');
//   // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* ) | AllocationExpression
//   const expression = (() => {
//     if (ctx.itr.peek.v === 'new') {
//       return readAllocationExpression(ctx);
//     }

//     let child;
//     if (ctx.itr.peek.v === 'function') {
//       child = ast.FunctionExpression.read(ctx);
//     } else {
//       child = readPrimaryExpression(ctx);
//     }
//     while (ctx.itr.peek.v === '[' || ctx.itr.peek.v === '.') {
//       child = readMemberExpressionPart(ctx, child);
//     }
//     return child;
//   })();
//   return new ast.MemberExpression(expression);
// }

const readMemberExpressionPart = ast.MemberExpressionPart.read;
module.exports.readMemberExpressionPart = readMemberExpressionPart;
// // MemberExpressionPart	::=	( "[" Expression "]" ) |	( "." Identifier )
// function readMemberExpressionPart(ctx, target) {
//   ctx.dlog('readMemberExpressionPart');
//   if (ctx.itr.peek.v === '[') {
//     ctx.itr.read('[');
//     const expression = readExpression(ctx);
//     ctx.itr.read(']');
//     return new ast.MemberExpressionPart('[', expression, target);
//   } else if (ctx.itr.peek.v === '.') {
//     ctx.itr.read('.');
//     const identifier = readIdentifier(ctx);
//     return new ast.MemberExpressionPart('.', identifier, target);
//   } else {
//     throw new Error();
//   }
// }

const readPrimaryExpression = ast.PrimaryExpression.read;
module.exports.readPrimaryExpression = readPrimaryExpression;
// // PrimaryExpression	::=
// //   "this"
// //   |	ObjectLiteral
// //   |	( "(" Expression ")" )
// //   |	Identifier
// //   |	ArrayLiteral
// //   |	Literal
// function readPrimaryExpression(ctx) {
//   ctx.dlog('readPrimaryExpression');
//   const peek = ctx.itr.peek.v;
//   if (peek === 'this') throw new NotImplementedError('this');
//   if (peek === '{') return readObjectLiteral(ctx);
//   if (peek === '[') return readArrayLiteral(ctx);
//   if (peek === '(') {
//     ctx.itr.read('(');
//     const exp = readExpression(ctx);
//     ctx.itr.read(')');
//     return exp;
//   }
//   if (isLiteral(ctx)) return readLiteral(ctx);

//   return readIdentifier(ctx);
// }

// module.exports.isLiteral = isLiteral;
// function isLiteral(ctx) {
//   return (
//     (ctx.itr.peek.v === 'null') |
//     (ctx.itr.peek.v === 'true') |
//     (ctx.itr.peek.v === 'false') |
//     (ctx.itr.peek.v === 'undefined') |
//     (ctx.itr.peek.t === 'number') |
//     (ctx.itr.peek.t === 'string')
//   );
// }

const readLiteral = ast.Literal.read;
module.exports.readLiteral = readLiteral;
// // Literal	::=	( <DECIMAL_LITERAL> | <HEX_INTEGER_LITERAL> | <STRING_LITERAL> | <BOOLEAN_LITERAL> | <NULL_LITERAL> | <REGULAR_EXPRESSION_LITERAL> )
// function readLiteral(ctx) {
//   ctx.dlog('readLiteral');
//   const literalAst = (() => {
//     if (ctx.itr.peek.t === 'string') return readString(ctx);
//     if (ctx.itr.peek.t === 'number') return readNumber(ctx);
//     if (ctx.itr.peek.v === 'null') {
//       ctx.itr.read('null');
//       return new ast.Literal(null);
//     }
//     if (ctx.itr.peek.v === 'true') {
//       ctx.itr.read('true');
//       return new ast.Literal(true);
//     }
//     if (ctx.itr.peek.v === 'false') {
//       ctx.itr.read('false');
//       return new ast.Literal(false);
//     }
//     if (ctx.itr.peek.v === 'undefined') {
//       ctx.itr.read('undefined');
//       return new ast.Literal(undefined);
//     }
//   })();

//   return literalAst;
// }

// module.exports.readNumber = readNumber;
// function readNumber(ctx) {
//   ctx.dlog('readNumber');
//   const num = ctx.itr.read();
//   return new ast.Literal(parseFloat(num));
// }

// module.exports.readString = readString;
// function readString(ctx) {
//   ctx.dlog('readString');
//   const str = ctx.itr.read();
//   return new ast.Literal(str);
// }

const readArrayLiteral = ast.ArrayLiteral.read;
module.exports.readArrayLiteral = readArrayLiteral;
// // ArrayLiteral	::=	"[" ( ( Elision )? "]" | ElementList Elision "]" | ( ElementList )? "]" )
// function readArrayLiteral(ctx) {
//   ctx.dlog('readArrayLiteral');
//   ctx.itr.read('[');

//   const elementList =
//     ctx.itr.peek.v === ']' ? new ast.ElementList([]) : readElementList(ctx);
//   ctx.itr.read(']');
//   return new ast.ArrayLiteral(elementList);
// }

const readElementList = ast.ElementList.read;
module.exports.readElementList = readElementList;
// // ElementList	::=	( Elision )? AssignmentExpression ( Elision AssignmentExpression )*
// function readElementList(ctx) {
//   ctx.dlog('readElementList');
//   const elements = [readAssignmentExpression(ctx)];
//   while (ctx.itr.peek.v === ',') {
//     ctx.itr.read(',');
//     elements.push(readAssignmentExpression(ctx));
//   }

//   return new ast.ElementList(elements);
// }

const readObjectLiteral = ast.ObjectLiteral.read;
module.exports.readObjectLiteral = readObjectLiteral;
// // ObjectLiteral	::=	"{" ( PropertyNameAndValueList )? "}"
// function readObjectLiteral(ctx) {
//   ctx.dlog('readObjectLiteral');
//   ctx.itr.read('{');
//   let values = null;
//   if (ctx.itr.peek.v !== '}') {
//     values = readPropertyNameAndValueList(ctx);
//   }
//   ctx.itr.read('}');

//   return new ast.ObjectLiteral(values);
// }

const readPropertyNameAndValueList = ast.PropertyNameAndValueList.read;
module.exports.readPropertyNameAndValueList = readPropertyNameAndValueList;
// // PropertyNameAndValueList	::=	PropertyNameAndValue ( "," PropertyNameAndValue | "," )*
// function readPropertyNameAndValueList(ctx) {
//   ctx.dlog('readPropertyNameAndValueList');
//   const elements = [readPropertyNameAndValue(ctx)];
//   while (ctx.itr.peek.v === ',') {
//     ctx.itr.read(',');
//     elements.push(readPropertyNameAndValue(ctx));
//   }

//   return new ast.PropertyNameAndValueList(...elements);
// }

const readPropertyNameAndValue = ast.PropertyNameAndValue.read;
module.exports.readPropertyNameAndValue = readPropertyNameAndValue;
// // PropertyNameAndValue	::=	PropertyName ":" AssignmentExpression
// function readPropertyNameAndValue(ctx) {
//   ctx.dlog('readPropertyNameAndValue');
//   const name = readPropertyName(ctx);
//   ctx.itr.read(':');
//   const value = readAssignmentExpression(ctx);
//   return new ast.PropertyNameAndValue(name, value);
// }

const readPropertyName = ast.PropertyName.read;
module.exports.readPropertyName = readPropertyName;
// // PropertyName	::=	Identifier |	<STRING_LITERAL>	|	<DECIMAL_LITERAL>
// function readPropertyName(ctx) {
//   ctx.dlog('readPropertyName');
//   if (ctx.itr.peek.t === 'string' || ctx.itr.peek.t === 'number') {
//     return readLiteral(ctx);
//   } else {
//     return readIdentifier(ctx);
//   }
// }

const readAllocationExpression = ast.AllocationExpression.read;
module.exports.readAllocationExpression = readAllocationExpression;
// // AllocationExpression	::=	( "new" MemberExpression ( ( Arguments ( MemberExpressionPart )* )* ) )
// function readAllocationExpression(ctx) {
//   ctx.dlog('readAllocationExpression');
//   throw new NotImplementedError('readAllocationExpression');
// }

const readVariableStatement = ast.VariableStatement.read;
module.exports.readVariableStatement = readVariableStatement;
// // VariableStatement	::=	"var" VariableDeclarationList ( ";" )?
// function readVariableStatement(ctx) {
//   ctx.dlog('readVariableStatement');
//   ctx.itr.read('var');
//   const child = readVariableDeclarationList(ctx);
//   ctx.skipSemi(ctx);
//   return new ast.VariableStatement(child);
// }

const readVariableDeclarationList = ast.VariableDeclarationList.read;
module.exports.readVariableDeclarationList = readVariableDeclarationList;
// // VariableDeclarationList	::=	VariableDeclaration ( "," VariableDeclaration )*
// function readVariableDeclarationList(ctx) {
//   ctx.dlog('readVariableDeclarationList');
//   const variableDeclaration = readVariableDeclaration(ctx);
//   if (ctx.itr.peek.v !== ',') {
//     return variableDeclaration;
//   }
//   const variableDeclarations = [variableDeclaration];
//   while (ctx.itr.peek.v === ',') {
//     ctx.itr.read(',');
//     variableDeclarations.push(readVariableDeclaration(ctx));
//   }
//   return new ast.VariableDeclarationList(variableDeclarations);
// }

const readVariableDeclaration = ast.VariableDeclaration.read;
module.exports.readVariableDeclaration = readVariableDeclaration;
// // VariableDeclaration	::=	Identifier ( Initialiser )?
// function readVariableDeclaration(ctx) {
//   ctx.dlog('readVariableDeclaration');
//   const identifier = readIdentifier(ctx);
//   const initialiser = ctx.itr.peek.v === '=' ? readInitialiser(ctx) : null;
//   return new ast.VariableDeclaration(identifier, initialiser);
// }

const readIdentifier = ast.Identifier.read;
module.exports.readIdentifier = readIdentifier;
// // Identifier	::=	<IDENTIFIER_NAME>
// function readIdentifier(ctx) {
//   ctx.dlog('readIdentifier');
//   const { value } = ctx.itr.next();
//   if (value.t !== 'identifier')
//     throw new Error(
//       'readIdentifier Expected identifier, got:' + JSON.stringify(value)
//     );
//   return new ast.Identifier(value.v);
// }

const readInitialiser = ast.Initialiser.read;
module.exports.readInitialiser = readInitialiser;
// Initialiser	::=	"=" AssignmentExpression
// function readInitialiser(ctx) {
//   ctx.dlog('readInitialiser');
//   ctx.itr.read('=');

//   return readAssignmentExpression(ctx);
// }
