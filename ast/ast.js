const globalScope = require('../global');
const NotImplementedError = require('../NotImplementedError');

const Scope = require('./helpers/Scope');
const StorageSlot = require('./helpers/StorageSlot');

const AstItem = require('./AstItem');
const BinaryExpressionAstItem = require('./BinaryExpressionAstItem');
const BinaryExpressionOperatorsAstItem = require('./BinaryExpressionOperatorsAstItem');

/* ------------------------------------------------------------------------- */

const Literal = require('./Literal');
const Identifier = require('./Identifier');
const ArrayLiteral = require('./ArrayLiteral');
const ElementList = require('./ElementList');
const ObjectLiteral = require('./ObjectLiteral');
const PropertyNameAndValueList = require('./PropertyNameAndValueList');
const PropertyNameAndValue = require('./PropertyNameAndValue');
const PropertyName = require('./PropertyName');
const MemberExpression = require('./MemberExpression');
const AllocationExpression = require('./AllocationExpression');
const MemberExpressionPart = require('./MemberExpressionPart');
const CallExpression = require('./CallExpression');
const CallExpressionPart = require('./CallExpressionPart');
const Arguments = require('./Arguments');
const ArgumentList = require('./ArgumentList');
const PostfixExpression = require('./PostfixExpression');
const { PostfixOperator } = require('./PostfixExpression');
const LeftHandSideExpression = require('./LeftHandSideExpression');
const UnaryExpression = require('./UnaryExpression');
const { UnaryOperator } = require('./UnaryExpression');
const {
  MultiplicativeOperator,
  MultiplicativeExpression,
  AdditiveOperator,
  AdditiveExpression,
  ShiftOperator,
  ShiftExpression
} = require('./arithmetic');
const RelationalExpression = require('./RelationalExpression');
const { RelationalOperator } = require('./RelationalExpression');
const EqualityExpression = require('./EqualityExpression');
const { EqualityOperator } = require('./EqualityExpression');
const {
  BitwiseANDOperator,
  BitwiseANDExpression,
  BitwiseXOROperator,
  BitwiseXORExpression,
  BitwiseOROperator,
  BitwiseORExpression
} = require('./bitwise');
const {
  LogicalANDOperator,
  LogicalANDExpression,
  LogicalOROperator,
  LogicalORExpression
} = require('./logical');
const ConditionalExpression = require('./ConditionalExpression');
const AssignmentExpression = require('./AssignmentExpression');
const { AssignmentOperator } = require('./AssignmentExpression');
const Expression = require('./Expression');
const Statement = require('./Statement');
const Block = require('./Block');
const StatementList = require('./StatementList');
const Initialiser = require('./Initialiser');
const EmptyStatement = require('./EmptyStatement');
const ExpressionStatement = require('./ExpressionStatement');
const IfStatement = require('./IfStatement');
const IterationStatement = require('./IterationStatement');
const ContinueStatement = require('./ContinueStatement');
const BreakStatement = require('./BreakStatement');
const ReturnStatement = require('./ReturnStatement');
const WithStatement = require('./WithStatement');
const {
  SwitchStatement,
  CaseBlock,
  Clause,
  CaseClause,
  DefaultClause
} = require('./switch');
const LabelledStatement = require('./LabelledStatement');
const {
  ThrowStatement,
  TryStatement,
  Catch,
  Finally
} = require('./TryThrowCatchFinally');
const {
  Function,
  FunctionDeclaration,
  FunctionExpression,
  NativeCode,
  FormalParameterList,
  FunctionBody
} = require('./Function');
const Program = require('./Program');
const { SourceElement, SourceElements } = require('./SourceElements');
const ImportStatement = require('./ImportStatement');
const Name = require('./Name');
const VariableStatement = require('./VariableStatement');
const VariableDeclarationList = require('./VariableDeclarationList');
const VariableDeclaration = require('./VariableDeclaration');

module.exports = {
  Literal,
  Identifier,
  ArrayLiteral,
  ElementList,
  ObjectLiteral,
  PropertyNameAndValueList,
  PropertyNameAndValue,
  PropertyName,
  MemberExpression,
  AllocationExpression,
  MemberExpressionPart,
  CallExpression,
  CallExpressionPart,
  Arguments,
  ArgumentList,
  LeftHandSideExpression,
  PostfixExpression,
  PostfixOperator,
  UnaryExpression,
  UnaryOperator,
  MultiplicativeExpression,
  MultiplicativeOperator,
  AdditiveExpression,
  AdditiveOperator,
  ShiftExpression,
  ShiftOperator,
  RelationalExpression,
  RelationalOperator,
  EqualityExpression,
  EqualityOperator,
  BitwiseANDExpression,
  BitwiseANDOperator,
  BitwiseXORExpression,
  BitwiseXOROperator,
  BitwiseORExpression,
  BitwiseOROperator,
  LogicalANDExpression,
  LogicalANDOperator,
  LogicalORExpression,
  LogicalOROperator,
  ConditionalExpression,
  AssignmentExpression,
  AssignmentOperator,
  Expression,
  Statement,
  Block,
  StatementList,
  VariableStatement,
  VariableDeclarationList,
  VariableDeclaration,
  Initialiser,
  EmptyStatement,
  ExpressionStatement,
  IfStatement,
  IterationStatement,
  ContinueStatement,
  BreakStatement,
  ReturnStatement,
  WithStatement,
  SwitchStatement,
  CaseBlock,
  Clause,
  CaseClause,
  DefaultClause,
  LabelledStatement,
  ThrowStatement,
  TryStatement,
  Catch,
  Finally,
  Function,
  NativeCode,
  FunctionDeclaration,
  FunctionExpression,
  FormalParameterList,
  FunctionBody,
  Program,
  SourceElements,
  SourceElement,
  ImportStatement,
  Name
};
