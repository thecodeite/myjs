const ParsingContext = require('./ParsingContext');
const { createRootScope, unlockScope } = require('./ast/helpers/Scope');
const Program = require('./ast/Program');

const src = `
function f() {
  return 1,2;
}
var x = f()
`;

// console.log('[...tokenize(src)]:', [...tokenize(src)]);
const context = new ParsingContext(src);
const program = Program.read(context);
console.log('ast: \n' + program.toStringAll());

const scope = createRootScope();
console.log('result: \n' + program.run(scope));
unlockScope();
scope.clean();
console.log('context.scope:', JSON.stringify(scope, null, '  '));
