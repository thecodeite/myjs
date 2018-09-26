const tokenize = require('./tokenizer');
const { readProgram } = require('./parser');

process.env.DEBUG = 'false';

function run(src) {
  const context = {
    scope: {},
    itr: tokenize(src)
  };
  const program = readProgram(context);
  program.run(context.scope);
  return context;
}

test('variable assignment', () => {
  const src = 'var a = 1;';
  const { scope } = run(src);
  expect(scope['a'].data).toEqual(1);
});

test('variable assignment2', () => {
  const src = 'var a = 1; var b = a;';
  const { scope } = run(src);
  expect(scope['a'].data).toEqual(1);
  expect(scope['b'].data).toEqual(1);
});

test('object literal', () => {
  const src = `
  var x = {a:1, b:2};
  var y = x.a;
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(1);
  expect(scope.x.data.b.data).toEqual(2);
  expect(scope['y'].data).toEqual(1);
});

test('object literal2', () => {
  const src = `
  var x = {a:1, b:2};
  var y = x['a'];
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(1);
  expect(scope.x.data.b.data).toEqual(2);
  expect(scope['y'].data).toEqual(1);
});

test('array literal', () => {
  const src = `
  var x = [1, 2];
  var y = x[0];
  `;
  const { scope } = run(src);
  expect(scope.x.data[0].data).toEqual(1);
  expect(scope.x.data[1].data).toEqual(2);
  expect(scope['y'].data).toEqual(1);
});

test('deep literal', () => {
  const src = `
  var x = {a:[{b:[1]}]};
  var y = x.a[0].b[0]
  `;
  const { scope } = run(src);
  expect(scope['y'].data).toEqual(1);
});

//
[['+', 40], ['-', 20], ['*', 300], ['/', 3], ['%', 0]].forEach(
  ([opp, expected]) => {
    test('math ' + opp, () => {
      const src = `var x = 30 ${opp} 10;`;
      const { scope } = run(src);
      expect(scope['x'].data).toEqual(expected);
    });
  }
);

test('function', () => {
  const src = `
  function f() {
    return 1
  }
  var x = f()
  `;
  const { scope } = run(src);
  expect(scope['x'].data).toEqual(1);
});

// test('function expression', () => {
//   const src = `
//   var f = function () {
//     return 1
//   }
//   var x = f()
//   `;
//   const { scope } = run(src);
//   expect(scope['x'].data).toEqual(1);
// });
