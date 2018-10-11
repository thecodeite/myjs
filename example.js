const ParsingContext = require('./ParsingContext');
const { createRootScope, unlockScope } = require('./ast/helpers/Scope');
const Program = require('./ast/Program');

const src = `
// An object can be passed as the first argument to call or apply and this will be bound to it.
var obj = {a: 'Custom'};

// This property is set on the global object
var a = 'Global';

function whatsThis(i, j) {
  return this.a + (i + j);  // The value of this is dependent on how the function is called
}

var x = whatsThis(1, 2);      // 'Global3'
var y = whatsThis.call(obj, 1, 2);  // 'Custom'
var z = whatsThis.apply(obj); // 'Custom'
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
