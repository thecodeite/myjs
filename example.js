const tokenize = require('./tokenizer');
const ParsingContext = require('./ParsingContext');
const { RootScope } = require('./ast/helpers/Scope');
const Program = require('./ast/Program');

const src = ``;

console.log('[...tokenize(src)]:', [...tokenize(src)]);
const context = new ParsingContext(tokenize(src));
const program = Program.read(context);
console.log('ast: \n' + program.toStringAll());

const scope = new RootScope();
console.log('result: \n' + program.run(scope));
console.log('context.scope:', JSON.stringify(scope, null, '  '));
