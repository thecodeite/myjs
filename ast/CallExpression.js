const Scope = require('./helpers/Scope');
const StorageSlot = require('./helpers/StorageSlot');

const AstItem = require('./AstItem');
const Arguments = require('./Arguments');

module.exports = class CallExpression extends AstItem {
  constructor(memExp, args) {
    super(memExp, args);

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
    const newScope = new Scope(scope);

    const argValues = this.args.run(scope);
    newScope['arguments'] = new StorageSlot(argValues);

    if (func.params.children) {
      for (let i = 0; i < func.params.children.length; i++) {
        const identifier = func.params.children[i];
        const value = argValues[i];
        newScope[identifier.name] = value;
      }
    }

    const funcResult = func.runBody(newScope);
    if ('__error' in newScope) {
      scope.__error = newScope.__error;
    }
    return funcResult;
  }
};
