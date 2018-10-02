const AstItem = require('./AstItem.js');
const Identifier = require('./Identifier.js');

class Function extends AstItem {
  constructor(identifier, params, body) {
    super(...[body].filter(Boolean));
    this.mustBeOrNull(() => identifier, Identifier);
    this.mustBe(() => params, FormalParameterList);

    this.identifier = identifier;
    this.params = params;
    this.body = body;
  }

  toJSON() {
    return this.toString();
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

  toString(pad = '') {
    return `${pad}[FunctionDeclaration:'${this.identifier.name}']`;
  }
}

class FunctionExpression extends Function {
  constructor(identifier, params, body) {
    super(identifier, params, body);
  }

  toString(pad = '') {
    return `${pad}[FunctionExpression:'${this.identifier.name}']`;
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
    super(...identifiers);

    if (
      !Array.isArray(identifiers) ||
      !identifiers.every(x => x instanceof Identifier)
    ) {
      throw new Error('FormalParameterList expects array of identifiers');
    }
  }
}

class FunctionBody extends AstItem {
  constructor(...children) {
    super(...children);
  }

  run(scope) {
    this.children.every(child => {
      child.run(scope);
      if ('__error' in scope) return;
      return !'__returnValue' in scope;
    });
    return scope.__returnValue;
  }
}

module.exports = {
  Function,
  FunctionDeclaration,
  FunctionExpression,
  NativeCode,
  FormalParameterList,
  FunctionBody
};
