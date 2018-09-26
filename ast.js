const NotImplementedError = require('./NotImplementedError');

class StorageObject {
  constructor(initialData) {
    this.data = initialData;
  }

  get(key) {
    // console.log(
    //   'GET key, this.data, this.data[key]:',
    //   key,
    //   this.data,
    //   this.data[key]
    // );
    return this.data[key];
  }

  valueOf() {
    return this.data;
  }
}

class AstItem {
  constructor(children) {
    if (!Array.isArray(children)) {
      throw new Error('children must be an array');
    }
    children.forEach(x => {
      if (x === null || x === undefined) {
        throw new Error('all children must be defined, got: ' + x);
      }

      if (Array.isArray(x)) {
        throw new Error(
          'all children must not be array, got: ' + x.constructor.name
        );
      }
      if (!x instanceof AstItem) {
        throw new Error(
          'all children must be instanceof AstItem, got: ' + x.constructor.name
        );
      }
      if (!x.toStringAll) {
        throw new Error(
          'all children must have x.toStringAll, got: ' + x.constructor.name
        );
      }
    });
    this.children = children;
  }

  run(scope) {
    let res = undefined;
    this.children.forEach(child => {
      res = child.run(scope);
    });
    return res;
  }

  toString(pad = '') {
    return `${pad}[${this.constructor.name}]`;
  }

  toStringAll(pad = '') {
    // if (pad.length === 0 && this.constructor.name !== 'Program') {
    //   throw new Error();
    // }
    let str = this.toString(pad);
    if (this.children.length) {
      str +=
        '\n' +
        this.children
          .map((child, i) => {
            if (!child.toStringAll) {
              console.log('no toStringAll' + child.constructor.name);
            }
            return i + child.toStringAll(pad + '  ');
          })
          .join('\n');
    }
    return str;
  }
}

class BinaryExpressionAstItem extends AstItem {
  constructor(left, right) {
    super([left, right].filter(x => x));
    this.left = left;
    this.right = right;
  }
}

class BinaryExpressionOperatorsAstItem extends BinaryExpressionAstItem {
  constructor(left, right, operator, validOperators) {
    super(left, right);
    if (!left) throw new Error('left missing');
    if (!right) throw new Error('right missing');
    this.left = left;
    this.right = right;
    this.operator = operator;
    this.validOperators = validOperators;

    if (!validOperators[operator]) {
      throw new Error(
        'Can not create BinaryExpressionAstItem with operator ' + operator
      );
    }
  }

  toString(pad = '') {
    return `${pad}[${this.constructor.name}:${this.operator}]`;
  }

  run(scope) {
    const left = this.left.run(scope);
    const right = this.right.run(scope);
    const result = this.validOperators[this.operator](left, right);
    return new StorageObject(result);
  }
}

/* ------------------------------------------------------------------------- */

class PrimaryExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Literal extends AstItem {
  constructor(value) {
    super([]);
    this.value = value;
  }

  run(scope) {
    return new StorageObject(this.value);
  }

  toString(pad = '') {
    return `${pad}[Literal:'${this.value}']`;
  }
}

class Identifier extends AstItem {
  constructor(identifierName) {
    super([]);
    if (typeof identifierName !== 'string') {
      throw new Error('identifierName must be string');
    }
    this.identifierName = identifierName;
  }

  toString(pad = '') {
    return `${pad}[Identifier:'${this.identifierName}']`;
  }

  run(scope) {
    let currentScope = scope;

    while (currentScope) {
      let id = this.identifierName;
      let val = currentScope[id];
      if (val !== undefined) {
        return val;
      }
      currentScope = currentScope.__parentScope;
    }

    return undefined;
  }
}

class ArrayLiteral extends AstItem {
  constructor(elementList) {
    super([elementList]);
    this.elementList = elementList;
  }

  run(scope) {
    return new StorageObject(this.elementList.run(scope));
  }
}

class ElementList extends AstItem {
  constructor(elements) {
    super(elements);
    this.elements = elements;
  }

  run(scope) {
    return this.elements.map(el => el.run(scope));
  }
}

class ObjectLiteral extends AstItem {
  constructor(propertyNameAndValueList) {
    super([propertyNameAndValueList].filter(x => x));
    this.propertyNameAndValueList = propertyNameAndValueList;
  }

  run(scope) {
    const keyValues = this.propertyNameAndValueList.run(scope);

    const value = keyValues.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return new StorageObject(value);
  }
}

class PropertyNameAndValueList extends AstItem {
  constructor(children) {
    super(children);
  }

  run(scope) {
    return this.children.map(x => x.run(scope));
  }
}

class PropertyNameAndValue extends AstItem {
  constructor(key, value) {
    super([value]);
    if (!key instanceof Identifier) {
      throw new Error('key must be Identifier');
    }
    this.key = key;
    this.value = value;
  }

  run(scope) {
    return {
      key: this.key.identifierName,
      value: this.value.run(scope)
    };
  }
}

class PropertyName extends AstItem {
  constructor(children) {
    super(children);
  }
}

class MemberExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class AllocationExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class MemberExpressionPart extends AstItem {
  constructor(type, name, target) {
    super([target, name]);
    if (!'[.'.includes(type)) {
      throw new Error('MemberExpressionPart: Valid types are [ or .');
    }
    this.type = type;
    this.name = name;
    this.target = target;
  }

  run(scope) {
    const target = this.target.run(scope);

    if (this.type === '.') {
      const name = this.name.identifierName;
      return target.get(name);
    } else if (this.type === '[') {
      const name = this.name.run(scope).valueOf();
      return target.get(name);
    }
  }
}

class CallExpression extends AstItem {
  constructor(memExp, args) {
    super([memExp, args]);

    this.memExp = memExp;
    this.args = args;
  }

  run(scope) {
    const func = this.memExp.run(scope);
    if (!func) {
      throw new Error(this.memExp + ' is not a function');
    }
    if (!func instanceof Function) {
      throw new Error(func + ' is not a function');
    }
    const newScope = { __parentScope: scope };
    return func.runBody(newScope);
  }
}

class CallExpressionPart extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Arguments extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ArgumentList extends AstItem {
  constructor(children) {
    super(children);
  }
}

class LeftHandSideExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

const PostfixOperator = {
  '++': () => {
    throw new NotImplementedError('PostfixOperator ++');
  },
  '--': () => {
    throw new NotImplementedError('PostfixOperator ++');
  }
};
class PostfixExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

const UnaryOperator = {
  delete: () => {
    throw new NotImplementedError('UnaryOperator: delete');
  },
  void: () => {
    throw new NotImplementedError('UnaryOperator: void');
  },
  typeof: () => {
    throw new NotImplementedError('UnaryOperator: typeof');
  },
  '++': () => {
    throw new NotImplementedError('UnaryOperator: ++');
  },
  '--': () => {
    throw new NotImplementedError('UnaryOperator: --');
  },
  '+': () => {
    throw new NotImplementedError('UnaryOperator: +');
  },
  '-': () => {
    throw new NotImplementedError('UnaryOperator: -');
  },
  '~': () => {
    throw new NotImplementedError('UnaryOperator: ~');
  },
  '!': () => {
    throw new NotImplementedError('UnaryOperator: !');
  }
};
class UnaryExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

MultiplicativeOperator = {
  '*': (left, right) => left * right,
  '/': (left, right) => left / right,
  '%': (left, right) => left % right
};
class MultiplicativeExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, MultiplicativeOperator);
  }
}

const AdditiveOperator = {
  '+': (left, right) => left + right,
  '-': (left, right) => left - right
};
class AdditiveExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, AdditiveOperator);
  }
}

const ShiftOperator = {
  '<<': (left, right) => left << right,
  '>>': (left, right) => left >> right,
  '>>>': (left, right) => left >>> right
};
class ShiftExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, ShiftOperator);
  }
}

const RelationalOperator = {
  '<': (left, right) => left < right,
  '>': (left, right) => left > right,
  '<=': (left, right) => left <= right,
  '>=': (left, right) => left >= right,
  instanceof: (left, right) => left instanceof right,
  in: (left, right) => left in right
};
class RelationalExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, RelationalOperator);
  }
}

const EqualityOperator = {
  '==': (left, right) => left == right,
  '!=': (left, right) => left != right,
  '===': (left, right) => left === right,
  '!==': (left, right) => left !== right
};
class EqualityExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, EqualityOperator);
  }
}

const BitwiseANDOperator = '&';
class BitwiseANDExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) & this.right.run(scope);
  }
}

const BitwiseXOROperator = '^';
class BitwiseXORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) ^ this.right.run(scope);
  }
}

const BitwiseOROperator = '|';
class BitwiseORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) | this.right.run(scope);
  }
}

const LogicalANDOperator = '&&';
class LogicalANDExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) && this.right.run(scope);
  }
}

const LogicalOROperator = '||';
class LogicalORExpression extends BinaryExpressionAstItem {
  constructor(left, right) {
    super(left, right);
  }

  run(scope) {
    return this.left.run(scope) || this.right.run(scope);
  }
}

class ConditionalExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class AssignmentExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class AssignmentOperator extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Expression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ExpressionNoIn extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Statement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Block extends AstItem {
  constructor(children) {
    super(children);
  }
}

class StatementList extends AstItem {
  constructor(children) {
    super(children);
  }
}

class VariableStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class VariableDeclarationList extends AstItem {
  constructor(children) {
    super(children);
  }
}

class VariableDeclaration extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Initialiser extends AstItem {
  constructor(children) {
    super(children);
  }
}

class EmptyStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ExpressionStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class IfStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class IterationStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ContinueStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class BreakStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ReturnStatement extends AstItem {
  constructor(expression) {
    super([expression]);
    this.expression = expression;
  }

  run(scope) {
    scope.__returnValue = this.expression.run(scope);
    return scope.__returnValue;
  }
}

class WithStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class SwitchStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class CaseBlock extends AstItem {
  constructor(children) {
    super(children);
  }
}

class CaseClauses extends AstItem {
  constructor(children) {
    super(children);
  }
}

class CaseClause extends AstItem {
  constructor(children) {
    super(children);
  }
}

class DefaultClause extends AstItem {
  constructor(children) {
    super(children);
  }
}

class LabelledStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ThrowStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class TryStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Catch extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Finally extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Function extends AstItem {
  constructor(identifier, params, body) {
    super([body]);

    this.identifier = identifier;
    this.params = params;
    this.body = body;
  }

  run(scope) {
    if (this.identifier) {
      scope[this.identifier.identifierName] = this;
    }
    return this;
  }

  runBody(scope) {
    this.children.every(child => {
      child.run(scope);
      return scope.__returnValue === undefined;
    });
    return scope.__returnValue;
  }
}

class FunctionDeclaration extends Function {
  constructor(identifier, params, body) {
    super(identifier, params, body);
  }
}

class FunctionExpression extends Function {
  constructor(identifier, params, body) {
    super(identifier, params, body);
  }
}

class FormalParameterList extends AstItem {
  constructor(children) {
    super(children);
  }
}

class FunctionBody extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Program extends AstItem {
  constructor(children) {
    super(children);
  }
}

class SourceElements extends AstItem {
  constructor(children) {
    super(children);
  }
}

class SourceElement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class ImportStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class Name extends AstItem {
  constructor(children) {
    super(children);
  }
}

class VarStatement extends AstItem {
  constructor(children) {
    super(children);
  }
}

class VarDeclarationList extends AstItem {
  constructor(children) {
    super(children);
  }
}

class VarDeclaration extends AstItem {
  constructor(identifier, initialiser) {
    super([initialiser].filter(x => x));
    this.identifier = identifier;
    this.initialiser = initialiser;
  }

  run(scope) {
    const id = this.identifier.identifierName;
    scope[id] = this.initialiser.run(scope);
  }

  toString(pad = '') {
    return `${pad}[VarDeclaration'${this.identifier}']`;
  }
}

module.exports = {
  PrimaryExpression,
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
  CaseClauses,
  CaseClause,
  DefaultClause,
  LabelledStatement,
  ThrowStatement,
  TryStatement,
  Catch,
  Finally,
  FunctionDeclaration,
  FunctionExpression,
  FormalParameterList,
  FunctionBody,
  Program,
  SourceElements,
  SourceElement,
  ImportStatement,
  Name,
  VarStatement,
  VarDeclarationList,
  VarDeclaration
};
