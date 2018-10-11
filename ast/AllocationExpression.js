const StorageSlot = require('./helpers/StorageSlot');
const AstItem = require('./AstItem');

module.exports = class AllocationExpression extends AstItem {
  constructor(memberExpression, argList) {
    const argBreakdown = argList
      .reduce((acc, c) => [...acc, c.args, c.mep], [])
      .filter(Boolean);
    super(memberExpression, ...argBreakdown);
    this.memberExpression = memberExpression;
    this.argList = argList;
  }

  run(scope) {
    let funcSlot = this.memberExpression.run(scope);

    if (!('__callable' in funcSlot)) {
      throw new Error(funcSlot + ' is not a function');
    }

    const newScope = scope.createChild();
    let argValues;

    if (this.argList.length) {
      argValues = this.argList[0].args.run(scope);
      newScope.addValue('arguments', argValues);
    }

    const params = funcSlot.__params;
    if (params && params.children) {
      for (let i = 0; i < params.children.length; i++) {
        const identifier = params.children[i];
        if (argValues && i in argValues) {
          newScope.addSlot(identifier.name, argValues[i]);
        } else {
          newScope.addValue(identifier.name, undefined);
        }
      }
    }

    const thisContext = newScope.addValue('this', {});

    const funcResult = funcSlot.__callable(newScope);
    newScope.bubbleError();

    return funcResult || thisContext;
  }

  static isNext(ctx) {
    return ctx.itr.peek.v === 'new';
  }

  // AllocationExpression	::=	( "new" MemberExpression ( ( Arguments ( MemberExpressionPart )* )* ) )
  static read(ctx) {
    ctx.dlog('readAllocationExpression');
    ctx.itr.read('new');
    const memberExpression = MemberExpression.read(ctx);
    const argList = [];
    while (Arguments.isNext(ctx)) {
      const args = Arguments.read(ctx);
      if (MemberExpressionPart.isNext(ctx)) {
        const mep = MemberExpressionPart.read(ctx);
        argList.push({ args, mep });
      } else {
        argList.push({ args });
      }
    }

    return new AllocationExpression(memberExpression, argList);
  }
};

const MemberExpressionPart = require('./MemberExpressionPart');
const MemberExpression = require('./MemberExpression');
const Arguments = require('./Arguments');
