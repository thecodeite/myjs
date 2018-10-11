const { FunctionStorageSlot } = require('./helpers/StorageSlot');
const AstItem = require('./AstItem');

module.exports = class CallExpression extends AstItem {
  constructor(memberExpression, args) {
    super(memberExpression, args);

    this.memberExpression = memberExpression;
    this.args = args;

    if (!args instanceof Arguments) {
      throw new Error('args must be an Arguments, got ' + args);
    }
  }

  run(scope) {
    const funcSlot = this.memberExpression.run(scope);
    if (!funcSlot) {
      throw new Error(
        this.memberExpression +
          ' does not point at a function ' +
          this.memberExpression +
          ' ' +
          funcSlot
      );
    }
    if (!'__callable' in funcSlot) {
      throw new Error(funcSlot + ' is not a function');
    }
    const newScope = scope.createChild();

    const argValues = this.args.run(scope);
    newScope.addValue('arguments', argValues);

    if (funcSlot.ref) {
      newScope.addSlot('this', funcSlot.ref);
    } else {
      newScope.addSlot('this', scope.getSlot('global'));
    }

    const params = funcSlot.__params;
    if (params && params.children) {
      for (let i = 0; i < params.children.length; i++) {
        const identifier = params.children[i];
        const value = argValues[i];
        if (value !== undefined) {
          newScope.addSlot(identifier.name, value);
        } else {
          newScope.addValue(identifier.name, undefined);
        }
      }
    }

    const funcResult = funcSlot.__callable(newScope);
    newScope.bubbleError();
    return funcResult;
  }
};

const Arguments = require('./Arguments');
