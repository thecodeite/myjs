const AstItem = require('./AstItem');
const LeftHandSideExpression = require('./LeftHandSideExpression');

const AssignmentOperator = {
  '=': (_, right) => right,
  '/=': (left, right) => left / right,
  '%=': (left, right) => left % right,
  '*=': (left, right) => left * right,
  '+=': (left, right) => left + right,
  '-=': (left, right) => left - right,
  '<<=': (left, right) => left << right,
  '>>=': (left, right) => left >> right,
  '>>>=': (left, right) => left >>> right,
  '&=': (left, right) => left & right,
  '^=': (left, right) => left ^ right,
  '|=': (left, right) => left | right
};
const assignmentOperators = Object.keys(AssignmentOperator);

class AssignmentExpression extends AstItem {
  constructor(left, right, operator) {
    super(left, right);
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

  // AssignmentExpression	::=	( LeftHandSideExpression AssignmentOperator AssignmentExpression | ConditionalExpression )
  static read(ctx) {
    ctx.dlog('readAssignmentExpression');
    const left = require('../old/parser').readConditionalExpression(ctx);

    if (assignmentOperators.includes(ctx.itr.peek.v)) {
      const operator = ctx.itr.read(assignmentOperators);
      const right = require('../old/parser').readAssignmentExpression(ctx);
      return new AssignmentExpression(left, right, operator);
    }
    return left;
  }
}

AssignmentExpression.AssignmentOperator = AssignmentOperator;
module.exports = AssignmentExpression;
