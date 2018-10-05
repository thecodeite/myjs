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

  // FunctionDeclaration	::=	 "function" Identifier ( "(" ( FormalParameterList )? ")" ) FunctionBody
  static read(ctx) {
    const {
      identifier,
      params,
      body
    } = readFunctionDeclarationOrFunctionExpression(ctx, true);
    return new FunctionDeclaration(identifier, params, body);
  }
}

class FunctionExpression extends Function {
  constructor(identifier, params, body) {
    super(identifier, params, body);
  }

  toString(pad = '') {
    return `${pad}[FunctionExpression:'${this.identifier.name}']`;
  }

  // FunctionExpression	::=	"function" ( Identifier )? ( "(" ( FormalParameterList )? ")" ) FunctionBody
  static read(ctx) {
    const {
      identifier,
      params,
      body
    } = readFunctionDeclarationOrFunctionExpression(ctx, false);
    return new FunctionExpression(identifier, params, body);
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

  // FormalParameterList ::= Identifier ( "," Identifier )*
  static read(ctx) {
    ctx.dlog('readFormalParameterList');
    const identifiers = [Identifier.read(ctx)];
    while (ctx.itr.peek.v === ',') {
      ctx.itr.read(',');
      identifiers.push(Identifier.read(ctx));
    }

    return new FormalParameterList(identifiers);
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

  static read(ctx) {
    // "{" ( SourceElements )? "}"
    ctx.dlog('readFunctionBody');
    ctx.itr.read('{');
    let sourceElements = new (require('../ast/SourceElements')).SourceElements(
      []
    );
    if (ctx.itr.peek.v !== '}') {
      sourceElements = require('../ast/SourceElements').SourceElements.read(
        ctx
      );
    }
    ctx.itr.read('}');
    return new FunctionBody(sourceElements);
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

function readFunctionDeclarationOrFunctionExpression(ctx, identifierRequired) {
  ctx.dlog('readFunctionDeclaration');
  ctx.itr.read('function');
  let identifier = null;
  if (ctx.itr.peek.v === '(') {
    if (identifierRequired) {
      throw new Error('Identifier expected');
    }
  } else {
    identifier = Identifier.read(ctx);
  }
  ctx.itr.read('(');
  let params = new FormalParameterList([]);
  if (ctx.itr.peek.v !== ')') {
    params = FormalParameterList.read(ctx);
  }
  ctx.itr.read(')');
  const body = FunctionBody.read(ctx);

  return { identifier, params, body };
}
