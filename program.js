const tokenize = require('./tokenizer');
const { readProgram } = require('./parser');

const src = `
var y = typeof function(){};
`;

const context = {
  scope: {},
  itr: tokenize(src)
};
const program = readProgram(context);
console.log('ast: \n' + program.toStringAll());
console.log('result: \n' + program.run(context.scope));
console.log('context.scope:', JSON.stringify(context.scope, null, '  '));
