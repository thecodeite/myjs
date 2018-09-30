const tokenize = require('./tokenizer');
const { readProgram } = require('./parser');

// const src1 = `var a = 100;
// var b = 20
// var c = a - b - 5 + 2;
// `;

const src = `
var y = {a:1, b:2};
var x = delete y.a;
`;
// var x = y++;

// console.log('tokenize(src).next():', tokenize(src).next());
// console.log(JSON.stringify([...tokenize(src2)], null, '  '));
// return;

const context = {
  scope: {},
  itr: tokenize(src)
};
const program = readProgram(context);
console.log('ast: \n' + program.toStringAll());
console.log('output: \n' + program.run(context.scope));
console.log('context.scope:', JSON.stringify(context.scope, null, '  '));
