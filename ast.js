const globalScope = require('./global');
const NotImplementedError = require('./NotImplementedError');

class StorageSlot {
  constructor(initialData, ref, key) {
    this.data = initialData;
    this.ref = ref;
    this.key = key;
  }

  getChild(key) {
    if (!Object.prototype.hasOwnProperty.call(this.data, key)) {
      // Should check hirachy here.
      return new StorageSlot(undefined);
    }

    if (key === 'length' && Array.isArray(this.data)) {
      return new StorageSlot(this.data.length);
    }

    const so = this.data[key];
    so.ref = this;
    so.key = key;
    return so;
  }

  set(value) {
    this.data = value;
  }

  toString() {
    return `«(${typeof this.data}) data:${this.data}»`;
  }

  toJSON(key) {
    if (typeof this.data === 'object' && this.data !== null) {
      return this.data;
    }
    return `«(${typeof this.data}) data:${this.data}»`;
  }

  valueOf() {
    return this.data;
  }

  typeOf() {
    return typeof this.data;
  }

  delete() {
    if (this.ref && this.key) {
      this.ref.data[this.key] = undefined;
      return new StorageSlot(true);
    } else {
      return new StorageSlot(false);
    }
  }
}

class AstItem {
  constructor(children) {
    if (!Array.isArray(children)) {
      throw new Error(this + 'children must be an array. Got:' + children);
    }
    children.forEach(x => {
      if (x === null || x === undefined) {
        throw new Error(this + ' all children must be defined, got: ' + x);
      }

      if (Array.isArray(x)) {
        throw new Error(
          this + ' all children must not be array, got: ' + x.constructor.name
        );
      }
      if (!x instanceof AstItem) {
        throw new Error(
          this +
            ' all children must be instanceof AstItem, got: ' +
            x.constructor.name
        );
      }
      if (!x.toStringAll) {
        throw new Error(
          this +
            ' all children must have x.toStringAll, got: ' +
            x.constructor.name
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

  mustBeOrNull(name, t) {
    if (this[name] === null) return;
    this.mustBe(name, t);
  }

  mustBe(name, t) {
    if (!(this[name] instanceof t)) {
      throw new Error(
        `${this} is expecting property ${name} to be ${t} but got ${this[name]}`
      );
    }
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
    const left = this.left.run(scope).valueOf();
    const right = this.right.run(scope).valueOf();
    const result = this.validOperators[this.operator](left, right);
    return new StorageSlot(result);
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
    return new StorageSlot(this.value);
  }

  toString(pad = '') {
    return `${pad}[Literal:'${this.value}']`;
  }
}

const True = new Literal(true);
const False = new Literal(false);

class Identifier extends AstItem {
  constructor(name) {
    super([]);
    if (typeof name !== 'string') {
      throw new Error('name must be string');
    }
    this.name = name;
  }

  toString(pad = '') {
    return `${pad}[Identifier:'${this.name}']`;
  }

  run(scope) {
    let currentScope = scope;

    let id = this.name;
    while (currentScope) {
      let val = currentScope[id];
      if (val !== undefined) {
        return val;
      }
      currentScope = currentScope.__parentScope;
    }

    throw new Error(id + ' is not defined');
  }
}

class ArrayLiteral extends AstItem {
  constructor(elementList) {
    super([elementList]);
    this.elementList = elementList;
  }

  run(scope) {
    return new StorageSlot(this.elementList.run(scope));
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
    if (!this.propertyNameAndValueList) {
      return new StorageSlot({});
    }
    const keyValues = this.propertyNameAndValueList.run(scope);

    const value = keyValues.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return new StorageSlot(value);
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
      key: this.key.name,
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
  constructor(expression) {
    super([expression]);
    this.expression = expression;
  }

  run(scope) {
    return this.expression.run(scope);
  }
}

class AllocationExpression extends AstItem {
  constructor(children) {
    super(children);
  }
}

class MemberExpressionPart extends AstItem {
  constructor(type, identifierOrExpression, target) {
    super([target, identifierOrExpression]);
    this.type = type;
    this.target = target;

    if (type === '.') {
      if (!identifierOrExpression instanceof Identifier) {
        throw new Error(
          'For . notation, name must be Identifier. Got: ' + name
        );
      }
      this.f = () => {
        return identifierOrExpression.name;
      };
    } else if (type === '[') {
      if (!identifierOrExpression instanceof Expression) {
        throw new Error(
          'For [ notation, name must be Expression. Got: ' + name
        );
      }
      this.f = scope => {
        return identifierOrExpression.run(scope).valueOf();
      };
    } else {
      throw new Error(
        'MemberExpressionPart: Valid types are [ or . Got: ' + type
      );
    }
  }

  run(scope) {
    const target = this.target.run(scope);

    if (!target) {
      throw new Error(`${this.target} does not exist in scope`);
    }

    const name = this.f(scope);
    return target.getChild(name);
  }
}

class CallExpression extends AstItem {
  constructor(memExp, args) {
    super([memExp, args]);

    this.memExp = memExp;
    this.args = args;

    if (!args instanceof Arguments) {
      throw new Error('args must be an Arguments, got ' + args);
    }
  }

  run(scope) {
    const func = this.memExp.run(scope);
    if (!func) {
      throw new Error(
        this.memExp +
          ' does not point at a function ' +
          this.memExp +
          ' ' +
          func
      );
    }
    if (!func instanceof Function) {
      throw new Error(func + ' is not a function');
    }
    const newScope = { __parentScope: scope };

    const argValues = this.args.run(scope);
    newScope['arguments'] = new StorageSlot(argValues);

    if (func.params.children) {
      for (let i = 0; i < func.params.children.length; i++) {
        const identifier = func.params.children[i];
        const value = argValues[i];
        newScope[identifier.name] = value;
      }
    }

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

  run(scope) {
    return this.children.map(child => child.run(scope));
  }
}

class LeftHandSideExpression extends AstItem {
  constructor(memberExpression) {
    super([memberExpression]);

    if (
      !(
        memberExpression instanceof MemberExpression ||
        memberExpression instanceof CallExpression
      )
    ) {
      throw new Error(
        'memberExpression must be MemberExpression or CallExpression. Got: ' +
          memberExpression
      );
    }
    this.memberExpression = memberExpression;
  }

  run(scope) {
    return this.memberExpression.run(scope);
  }
}

const PostfixOperator = {
  '++': x => x + 1,
  '--': x => x - 1
};

class PostfixExpression extends AstItem {
  constructor(leftHandSizeExpression, postfixOperator) {
    super([leftHandSizeExpression]);
    this.leftHandSizeExpression = leftHandSizeExpression;
    this.postfixOperator = PostfixOperator[postfixOperator];

    this.mustBe('leftHandSizeExpression', LeftHandSideExpression);
  }

  run(scope) {
    const so = this.leftHandSizeExpression.run(scope);
    const initialValue = so.valueOf();
    const value = this.postfixOperator(initialValue);
    so.set(value);
    return new StorageSlot(initialValue);
  }
}

const UnaryOperator = {
  delete: () => {
    throw new NotImplementedError('UnaryOperator: delete');
  },
  typeof: old => old.typeOf(),
  void: () => undefined,
  '++': old => old.valueOf() + 1,
  '--': old => old.valueOf() - 1,
  '+': old => +old.valueOf(),
  '-': old => -old.valueOf(),
  '~': old => ~old.valueOf(),
  '!': old => !old.valueOf()
};
const MutatingUnaryOperators = ['++', '--'];
class UnaryExpression extends AstItem {
  constructor(unaryOperator, unaryExpression) {
    super([unaryExpression]);

    this.unaryOperator = unaryOperator;
    this.unaryOperatorF = UnaryOperator[unaryOperator];
    this.unaryExpression = unaryExpression;
  }

  run(scope) {
    const so = this.unaryExpression.run(scope);

    if (this.unaryOperator === 'delete') {
      return so.delete();
    }

    const newVal = this.unaryOperatorF(so);
    if (MutatingUnaryOperators.includes(this.unaryOperator)) {
      so.set(newVal);
      return so;
    } else {
      return new StorageSlot(newVal);
    }
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
  in: (left, right) => {
    if (typeof right !== 'object') {
      throw new Error(
        `TypeError: Cannot use 'in' operator to search for ${JSON.stringify(
          left
        )} in ${JSON.stringify(right)}`
      );
    }
    const rightObject = right.valueOf();
    return left in rightObject;
  }
};
class RelationalExpression extends BinaryExpressionOperatorsAstItem {
  constructor(left, right, operator) {
    super(left, right, operator, RelationalOperator);
  }

  run(scope) {
    return super.run(scope);
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

const AssignmentOperator = {
  '=': (_, right) => right,
  '/=': (left, right) => left / right,
  '%=': (left, right) => left % right,
  '+=': (left, right) => left + right,
  '-=': (left, right) => left - right,
  '<<=': (left, right) => left << right,
  '>>=': (left, right) => left >> right,
  '>>>=': (left, right) => left >>> right,
  '&=': (left, right) => left & right,
  '^=': (left, right) => left ^ right,
  '|=': (left, right) => left | right
};
class AssignmentExpression extends AstItem {
  constructor(left, right, operator) {
    super([left, right]);
    if (!left || !left instanceof LeftHandSideExpression) {
      throw new Error(
        'Expected left to be LeftHandSideExpression but got: ' + left
      );
    }
    this.left = left;
    this.right = right;
    this.operator = operator;
  }

  run(scope) {
    const f = AssignmentOperator[this.operator];
    const left = this.left.run(scope);

    if (!left) {
      throw new Error(`var ${this.left} not found`);
    }

    const right = this.right.run(scope);
    const newVal = f(left.valueOf(), right.valueOf());
    left.set(newVal);
    return newVal;
  }

  toString(pad = '') {
    return `${pad}[AssignmentExpression'${this.identifier}']`;
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
  constructor(statements) {
    super(statements);
    this.statements = statements;
  }

  run(scope) {
    for (let statement of this.statements) {
      statement.run(scope);

      if (scope.__break || scope.__continue) {
        return;
      }
    }
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
  constructor(expression, statement, elseStatement) {
    super([expression, statement, elseStatement].filter(Boolean));

    this.expression = expression;
    this.statement = statement;
    this.elseStatement = elseStatement;
  }

  run(scope) {
    const expressionValue = this.expression.run(scope).valueOf();
    if (expressionValue) {
      this.statement.run(scope);
    } else if (this.elseStatement) {
      this.elseStatement.run(scope);
    }
  }
}

class IterationStatement extends AstItem {
  constructor(name, expressions, statement) {
    super([...Object.values(expressions), statement]);
    this.name = name;
    this.expressions = expressions;
    this.statement = statement;
  }

  run(scope) {
    const {
      variableDeclaration,
      initialExpression,
      continueExpression,
      finalExpression,
      valueExpression,
      leftHandSideExpression,
      initializationExpression
    } = this.expressions;

    if (valueExpression) {
      if (!variableDeclaration && !leftHandSideExpression) {
        if (!variableDeclaration instanceof VariableDeclaration) {
          throw new Error('in expects VariableDeclaration');
        }
        if (!leftHandSideExpression instanceof LeftHandSideExpression) {
          throw new Error('in expects VariableDeclaration');
        }
      }

      let storageSlot;
      if (variableDeclaration) {
        const varName = variableDeclaration.identifier.name;
        variableDeclaration.run(scope);
        storageSlot = scope[varName];
      } else if (leftHandSideExpression) {
        storageSlot = leftHandSideExpression.run(scope);
      }

      const value = valueExpression.run(scope);
      const keys = Object.keys(value.data);

      for (var i = 0; i < keys.length; i++) {
        storageSlot.set(keys[i]);
        this.statement.run(scope);

        if (scope.__break) {
          delete scope.__break;
          break;
        }
        if (scope.__continue) {
          delete scope.__continue;
        }
      }

      return;
    }

    if (variableDeclaration) variableDeclaration.run(scope);
    if (initializationExpression) initializationExpression.run(scope);

    const initialExpressionValue = (initialExpression || continueExpression)
      .run(scope)
      .valueOf();

    if (!initialExpressionValue) return;

    let loop;
    do {
      this.statement.run(scope);
      if (scope.__break) {
        delete scope.__break;
        break;
      }
      if (scope.__continue) {
        delete scope.__continue;
      }
      if (finalExpression) {
        finalExpression.run(scope);
      }
      loop = continueExpression.run(scope).valueOf();
    } while (loop);
  }
}

class ContinueStatement extends AstItem {
  constructor() {
    super([]);
  }

  run(scope) {
    scope.__continue = true;
  }
}

class BreakStatement extends AstItem {
  constructor() {
    super([]);
  }

  run(scope) {
    scope.__break = true;
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
    super(body ? [body] : []);

    this.identifier = identifier;
    this.params = params;
    this.body = body;

    this.mustBeOrNull('identifier', Identifier);
    this.mustBe('params', FormalParameterList);
  }

  valueOf() {
    return this.toStringAll();
  }

  typeOf() {
    return 'function';
  }

  run(scope) {
    if (this.identifier) {
      scope[this.identifier.name] = this;
    }
    return this;
  }

  runBody(scope) {
    this.body.run(scope);
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

class NativeCode extends Function {
  constructor(code) {
    super(null, new FormalParameterList([]));
    this.code = code;
  }

  toString(pad = '') {
    return `${pad}[NativeCode]`;
  }

  toJSON() {
    return `[NativeCode]`;
  }

  runBody(scope) {
    this.code(scope);
  }
}

class FormalParameterList extends AstItem {
  constructor(identifiers) {
    super(identifiers);

    if (
      !Array.isArray(identifiers) ||
      !identifiers.every(x => x instanceof Identifier)
    ) {
      throw new Error('FormalParameterList expects array of identifiers');
    }
  }
}

class FunctionBody extends AstItem {
  constructor(children) {
    super(children);
  }

  run(scope) {
    this.children.every(child => {
      child.run(scope);
      return !'__returnValue' in scope;
    });
    return scope.__returnValue;
  }
}

class Program extends AstItem {
  constructor(children) {
    super(children);
  }

  run(scope) {
    scope.__parentScope = globalScopeInstance;
    super.run(scope);
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

class VariableStatement extends AstItem {
  constructor(child) {
    super([child]);
  }
}

class VariableDeclarationList extends AstItem {
  constructor(variableDeclarations) {
    super(variableDeclarations);
    this.variableDeclarations = variableDeclarations;
  }

  run(scope) {
    for (var variableDeclaration of this.variableDeclarations) {
      variableDeclaration.run(scope);
    }
  }
}

class VariableDeclaration extends AstItem {
  constructor(identifier, initialiser) {
    super([initialiser].filter(x => x));
    this.identifier = identifier;
    this.initialiser = initialiser;

    if (!identifier || !identifier instanceof Identifier) {
      throw new Errror('identifier must be an Identifier, got:' + Identifier);
    }
  }

  run(scope) {
    const id = this.identifier.name;
    if (this.initialiser) {
      scope[id] = this.initialiser.run(scope);
    } else {
      scope[id] = new StorageSlot(undefined);
    }
  }

  toString(pad = '') {
    return `${pad}[VariableDeclaration'${this.identifier.name}']`;
  }
}

module.exports = {
  PrimaryExpression,
  Literal,
  True,
  False,
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

const globalScopeInstance = globalScope(NativeCode, StorageSlot);
console.log('globalScopeInstance:', globalScopeInstance);
