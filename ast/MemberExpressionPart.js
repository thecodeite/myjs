const AstItem = require('./AstItem');
const Identifier = require('./Identifier');
const Expression = require('./Expression');

module.exports = class MemberExpressionPart extends AstItem {
  constructor(type, identifierOrExpression, target) {
    super(target, identifierOrExpression);
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

  // MemberExpressionPart	::=	( "[" Expression "]" ) |	( "." Identifier )
  static read(ctx, target) {
    ctx.dlog('readMemberExpressionPart');
    if (ctx.itr.peek.v === '[') {
      ctx.itr.read('[');
      const expression = require('../old/parser').readExpression(ctx);
      ctx.itr.read(']');
      return new MemberExpressionPart('[', expression, target);
    } else if (ctx.itr.peek.v === '.') {
      ctx.itr.read('.');
      const identifier = require('../old/parser').readIdentifier(ctx);
      return new MemberExpressionPart('.', identifier, target);
    } else {
      throw new Error();
    }
  }
};
