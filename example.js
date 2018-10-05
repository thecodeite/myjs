const tokenize = require('./tokenizer');
const ParsingContext = require('./ParsingContext');
const { RootScope } = require('./ast/helpers/Scope');
const Program = require('./ast/Program');

const src = `
try {
  console.log('good');
  throw 'error';
  console.log('bad');
} finally {
  console.log('finally');
}
`;

const context = new ParsingContext(tokenize(src));
const program = Program.read(context);
console.log('ast: \n' + program.toStringAll());

const scope = new RootScope();
console.log('result: \n' + program.run(scope));
console.log('context.scope:', JSON.stringify(scope, null, '  '));
