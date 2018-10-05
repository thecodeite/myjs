const AstItem = require('./AstItem');
const MemberExpression = require('./MemberExpression');
const CallExpression = require('./CallExpression');

module.exports = class LeftHandSideExpression extends AstItem {
  constructor(memberExpression) {
    super(memberExpression);

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

  // LeftHandSideExpression ::= CallExpression | MemberExpression
  static read(ctx) {
    ctx.dlog('readLeftHandSideExpression');
    const memExp = require('../old/parser').readMemberExpression(ctx);

    if (ctx.itr.peek.v === '(') {
      const args = require('../old/parser').readArguments(ctx);
      return new LeftHandSideExpression(new CallExpression(memExp, args));
    }
    // return memExp;
    return new LeftHandSideExpression(memExp);
  }
};
