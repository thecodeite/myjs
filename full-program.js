const tokenize = require('./tokenizer');
const { readProgram } = require('./parser');

const src = `
var a = 1;

function func1() {
  return 1;
}

var func2 = function (a) {
  return a + 2;
}

function func3 (x) {
  var y = 1
  while(x) {
    y *= 2;
    x--;
  }
  return y;
}

console.log(func1() + func2(5) + func3(10))
`;

const context = {
  scope: {},
  itr: tokenize(src)
};
const program = readProgram(context);
console.log('ast: \n' + program.toStringAll());
console.log('result: \n' + program.run(context.scope));
// console.log('context.scope:', JSON.stringify(context.scope, null, '  '));
