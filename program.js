const tokenize = require('./tokenizer');
const { readProgram } = require('./parser');

const src = `
function who(name) {
  var res = ''
  switch(name) {
    case 'sam': res += 'Sam';
    case 'sophie': res += 'Sophile';
    default: res += 'Anonymouse';
  }
  return name;
}

var sam = who('sam');
var sophie = who('sophie');
var bob = who('bob');
`;

const context = {
  scope: {},
  itr: tokenize(src)
};
const program = readProgram(context);
console.log('ast: \n' + program.toStringAll());
console.log('result: \n' + program.run(context.scope));
console.log('context.scope:', JSON.stringify(context.scope, null, '  '));
