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
};
