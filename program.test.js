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

test('empty object literal', () => {
  const src = `
  var x = {};
  var y = x.a;
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual({});
  expect(scope.y.data).toEqual(undefined);
});

test('object literal', () => {
  const src = `
  var x = {a:1, b:2};
  var y = x.a;
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(1);
  expect(scope.x.data.b.data).toEqual(2);
  expect(scope.y.data).toEqual(1);
});

test('object literal2', () => {
  const src = `
  var x = {a:1, b:2};
  var y = x['a'];
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(1);
  expect(scope.x.data.b.data).toEqual(2);
  expect(scope.y.data).toEqual(1);
});

test('array literal', () => {
  const src = `
  var x = [1, 2];
  var y = x[0];
  `;
  const { scope } = run(src);
  expect(scope.x.data[0].data).toEqual(1);
  expect(scope.x.data[1].data).toEqual(2);
  expect(scope.y.data).toEqual(1);
});

test('deep literal', () => {
  const src = `
  var x = {a:[{b:[1]}]};
  var y = x.a[0].b[0]
  `;
  const { scope } = run(src);
  expect(scope.y.data).toEqual(1);
});

describe('arithmatic operators', () => {
  function testArithmaticOp(op, expected) {
    const src = `var x = 30 ${op} 10;`;
    const { scope } = run(src);
    expect(scope.x.data).toEqual(expected);
  }

  test('arithmatic +', () => testArithmaticOp('+', 40));
  test('arithmatic -', () => testArithmaticOp('-', 20));
  test('arithmatic *', () => testArithmaticOp('*', 300));
  test('arithmatic /', () => testArithmaticOp('/', 3));
  test('arithmatic %', () => testArithmaticOp('%', 0));
});

describe('relational operators', () => {
  function testRelationalOp(left, op, right, expected) {
    const src = `var x = ${left} ${op} ${right};`;
    const { scope } = run(src);
    expect(scope.x.data).toEqual(expected);
  }

  test('relational > less', () => testRelationalOp(10, '>', 20, false));
  test('relational > equal', () => testRelationalOp(10, '>', 10, false));
  test('relational > greater', () => testRelationalOp(20, '>', 10, true));
  test('relational < less', () => testRelationalOp(10, '<', 20, true));
  test('relational < equal', () => testRelationalOp(10, '<', 10, false));
  test('relational < greater', () => testRelationalOp(20, '<', 10, false));
  test('relational >= less', () => testRelationalOp(10, '>=', 20, false));
  test('relational >= equal', () => testRelationalOp(10, '>=', 10, true));
  test('relational >= greater', () => testRelationalOp(20, '>=', 10, true));
  test('relational <= less', () => testRelationalOp(10, '<=', 20, true));
  test('relational <= equal', () => testRelationalOp(10, '<=', 10, true));
  test('relational <= greater', () => testRelationalOp(20, '<=', 10, false));

  test('relational in', () => testRelationalOp('"a"', 'in', '{a:1}', true));
  test('relational no in', () => testRelationalOp('"a"', 'in', '{}', false));
});

test('function', () => {
  const src = `
  function f() {
    return 1
  }
  var x = f()
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(1);
});

test('function expression', () => {
  const src = `
  var f = function () {
    return 1
  }
  var x = f()
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(1);
});

test('function arg', () => {
  const src = `
  var a = 4
  function f (a) {
    return 1 + a
  }
  var x = f(2)
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(3);
  expect(scope.a.data).toEqual(4);
});

test('function 2 args', () => {
  const src = `
  function f (a, b) {
    return 1 + a + b
  }
  var x = f(2, 3)
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(6);
});

test('function closure args', () => {
  const src = `
  var CONST = 10;
  function f (a) {
    return a * CONST
  }
  var x = f(5)
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(50);
});

test('function closure function', () => {
  const src = `
  function ten() {
    return 10
  }
  function f (a) {
    return a * ten()
  }
  var x = f(5)
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(50);
});

test('function arg function', () => {
  const src = `
  function t () {
    return 10
  }
  function f (a, fn) {
    return a * fn()
  }
  var x = f(5, t)
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(50);
});

describe('postfix operator', () => {
  const f = (postfix, expected) => () => {
    const src = `
      var y = 3;
      var x = y${postfix};
  `;
    const { scope } = run(src);
    expect(scope.x.data).toEqual(3);
    expect(scope.y.data).toEqual(expected);
  };

  test('++ postfix operator', f('++', 4));
  test('-- postfix operator', f('--', 2));
});

test('object reverence', () => {
  const src = `
    var x = {a: 1};
    var y = x;
    x.a = 2;

  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(2);
  expect(scope.y.data.a.data).toEqual(2);
});

test('unary delete property', () => {
  const src = `
    var y = {a:1, b:2};
    var x = delete y.a;
    `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(true);
  expect(scope.y.data.a).toEqual(undefined);
  expect(scope.y.data.b.data).toEqual(2);
});

test('unary delete var', () => {
  const src = `
    var y = 1;
    var x = delete y;
    `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(false);
  expect(scope.y.data).toEqual(1);
});

describe('unary mutating arathmetic operator', () => {
  const f = (prefix, input, expected) => () => {
    const src = `
    var y = ${input};
    var x = ${prefix}y;
    `;
    const { scope } = run(src);
    expect(scope.x.data).toEqual(expected);
    expect(scope.y.data).toEqual(expected);
  };

  test('++ unary operator', f('++', 3, 4));
  test('-- unary operator', f('--', 3, 2));
});

describe('unary non-mutating arathmetic operator', () => {
  const f = (prefix, input, expected) => () => {
    const src = `
    var y = ${input};
    var x = ${prefix}y;
    `;
    const { scope } = run(src);
    expect(scope.x.data).toEqual(expected);
    expect(scope.y.data).toEqual(eval(input));
  };

  test('+ unary operator on 3', f('+', 3, 3));
  test('+ unary operator on -3', f('+', -3, -3));
  test('+ unary operator on "3"', f('+', "'3'", 3));
  test('- unary operator on 3', f('-', 3, -3));
  test('- unary operator on -3', f('-', -3, 3));
  test('~ unary operator', f('~', 3, -4));
  test('! unary operator on 0', f('!', 0, true));
  test('! unary operator on 1', f('!', 1, false));
  test('! unary operator on true', f('!', true, false));
  test('! unary operator on false', f('!', false, true));
});

test('unary void', () => {
  const src = `
    var y = void(0)
    `;
  const { scope } = run(src);
  expect(scope.y.data).toEqual(undefined);
});

test('unary void', () => {
  const src = `
    var y = void(0)
    `;
  const { scope } = run(src);
  expect(scope.y.data).toEqual(undefined);
});

describe('unary typeof operator', () => {
  const f = (input, expected) => () => {
    const src = `
    var y = typeof ${input};
    `;
    const { scope } = run(src);
    expect(scope.y.data).toEqual(expected);
  };

  test('typeof number', f('3', 'number'));
  test('typeof string', f('"3"', 'string'));
  test('typeof boolean', f('true', 'boolean'));
  test('typeof null', f('null', 'object'));
  test('typeof undefined', f('undefined', 'undefined'));
  test('typeof object', f('{}', 'object'));
  test('typeof function', f('function(){}', 'function'));
});

describe('test assignment operators', () => {
  function testAsgnOp(op, expected) {
    return () => {
      const src = `var x = 16; x ${op} 8;`;
      const { scope } = run(src);
      expect(scope.x.data).toEqual(expected);
    };
  }
  it('=', testAsgnOp('=', 8));
  it('/=', testAsgnOp('/=', 2));
  it('*=', testAsgnOp('*=', 128));
  it('%=', testAsgnOp('%=', 0));
  it('+=', testAsgnOp('+=', 24));
  it('-=', testAsgnOp('-=', 8));
  it('<<=', testAsgnOp('<<=', 4096));
  it('>>=', testAsgnOp('>>=', 0));
  it('>>>=', testAsgnOp('>>>=', 0));
  it('&=', testAsgnOp('&=', 0));
  it('^=', testAsgnOp('^=', 24));
  it('|=', testAsgnOp('|=', 24));
});

test('object assignment to dot property', () => {
  const src = `
  var x = {a:1};
  x.a = 2
  var y = x.a
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(2);
  expect(scope.y.data).toEqual(2);
});

test('object assignment to array property', () => {
  const src = `
  var x = {a:1};
  x['a'] = 2
  var y = x['a']
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data).toEqual(2);
  expect(scope.y.data).toEqual(2);
});

test('deep assignment', () => {
  const src = `
  var x = {a:[{b:[1]}]};
  x.a[0].b[0] = 2
  var y = x.a[0].b[0]
  `;
  const { scope } = run(src);
  expect(scope.x.data.a.data[0].data.b.data[0].data).toEqual(2);
  expect(scope.y.data).toEqual(2);
});

test('do loop', () => {
  const src = `
  var x = 0;
  var y = 0
  while (x < 10) {
    x++;
    y+=2;
  }`;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(10);
  expect(scope.y.data).toEqual(20);
});

test('do loop', () => {
  const src = `
  var x = 0;
  var y = 0
  while (x < 10) {
    x++;
    y+=2;
  }`;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(10);
  expect(scope.y.data).toEqual(20);
});

test('if', () => {
  const src = `
  var a = 10;
  var b = 20;
  var x = false, y = false, z = false;
  if (a > b) {
    x = true;
  } else {
    z = true;
  }

  if (b > a) {
    y = true;
  }
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(false);
  expect(scope.y.data).toEqual(true);
  expect(scope.z.data).toEqual(true);
});

test('while break', () => {
  const src = `
  var x = 0;
  var y = 0;
  var z = 0;
  while (x < 10) {
    x++;
    y+=2;
    if (y > 9) {
      break;
    }
    z++;
  }
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(5);
  expect(scope.y.data).toEqual(10);
  expect(scope.z.data).toEqual(4);
});

test('nested while', () => {
  const src = `
  var x = 0;
  var y = 0;
  var z = 0;

  while (x < 10) {
    x++;
    y = 0;
    while (y < 10) {
      y++;
      z++;
    }
  }
  `;
  const { scope } = run(src);
  expect(scope.z.data).toEqual(100);
});

test('while continue', () => {
  const src = `
  var x = 0;
  var y = 0
  while (x < 10) {
    x++;
    if (x%2) {
      continue;
    }
    y+=2;
  }
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(10);
  expect(scope.y.data).toEqual(10);
});

test('for var i loop', () => {
  const src = `
  var x = 0;
  for(var i=0; i<10; i++) {
    x++;
  }
  `;
  const { scope } = run(src);
  expect(scope.i.data).toEqual(10);
  expect(scope.x.data).toEqual(10);
});

test('for i loop', () => {
  const src = `
  var x = 0;
  var i = 0;
  for(i=0; i<10; i++) {
    x++;
  }
  `;
  const { scope } = run(src);
  expect(scope.i.data).toEqual(10);
  expect(scope.x.data).toEqual(10);
});

test('for var in loop', () => {
  const src = `
  var x = 0;
  var arr = [1,2,3,4,5,6,7,8,9,10]
  for(var i in arr) {
    x++;
  }
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(10);
});

test('for in loop', () => {
  const src = `
  var x = 0;
  var arr = [1,2,3,4,5,6,7,8,9,10];
  var i;
  for(i in arr) {
    x++;
  }
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(10);
});

test('case return statement', () => {
  const src = `
  function who(name) {
    switch(name) {
      case 'sam': return 'Sam Plews';
      case 'bob': return 'Bob Koonin';
    }
  }

  var sam = who('sam');
  var bob = who('bob');
  `;
  const { scope } = run(src);
  expect(scope.sam.data).toEqual('Sam Plews');
  expect(scope.bob.data).toEqual('Bob Koonin');
});

test('case default return statement', () => {
  const src = `
  function who(name) {
    switch(name) {
      case 'sam': return 'Sam Plews';
      case 'bob': return 'Bob Koonin';
      default: return 'Anonymouse'
    }
  }

  var sam = who('sam');
  var bob = who('bob');
  var charlie = who('charlie');
  `;
  const { scope } = run(src);
  expect(scope.sam.data).toEqual('Sam Plews');
  expect(scope.bob.data).toEqual('Bob Koonin');
  expect(scope.charlie.data).toEqual('Anonymouse');
});

test('case fallthrough statement', () => {
  const src = `
  function who(name) {
    var res = ''
    switch(name) {
      case 'sam': res += 'Sam ';
      case 'bob': res += 'Bob ';
      default: res += 'Anonymouse';
    }
    return res;
  }

  var sam = who('sam');
  var bob = who('bob');
  var charlie = who('charlie');
  `;
  const { scope } = run(src);
  expect(scope.sam.data).toEqual('Sam Bob Anonymouse');
  expect(scope.bob.data).toEqual('Bob Anonymouse');
  expect(scope.charlie.data).toEqual('Anonymouse');
});

test('case break statement', () => {
  const src = `
  function who(name) {
    var res = ''
    switch(name) {
      case 'sam': res = 'Sam'; break;
      case 'bob': res = 'Bob'; break;
      default: res = 'Anonymouse'; break;
    }
    return res;
  }

  var sam = who('sam');
  var bob = who('bob');
  var charlie = who('charlie');
  `;
  const { scope } = run(src);
  expect(scope.sam.data).toEqual('Sam');
  expect(scope.bob.data).toEqual('Bob');
  expect(scope.charlie.data).toEqual('Anonymouse');
});

test('console.log', () => {
  const src = `
  console.log('hello')
  `;
  const { scope } = run(src);
  expect(scope.__parentScope.__stdout).toEqual('hello\n');
});

test('array length', () => {
  const src = `
    var arr = [1,2,3];
    var x = arr.length;
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(3);
});

test('try', () => {
  const src = `
    try {
      console.log('good');
    } catch (e) {
      console.log('bad')
    }
  `;
  const { scope } = run(src);
  expect(scope.__parentScope.__stdout).toEqual('good\n');
});

test('try throw catch', () => {
  const src = `
    try {
      console.log('good');
      throw 'error';
      console.log('bad');
    } catch (e) {
      console.log(e);
      console.log('caught');
    }
  `;
  const { scope } = run(src);
  expect(scope.__parentScope.__stdout).toEqual('good\nerror\ncaught\n');
});

test('try throw finally', () => {
  const src = `
    try {
      console.log('good');
      throw 'error';
      console.log('bad');
    } finally {
      console.log('finally');
    }
  `;
  const { scope } = run(src);
  expect(scope.__parentScope.__stdout).toEqual('good\nfinally\n');
});

test('try loop throw catch', () => {
  const src = `
    try {
      console.log('good');
      do {
        console.log('loop-start');
        throw 'error';
        console.log('loop-end');
      } while(false)
      console.log('bad');
    } catch (e) {
      console.log(e);
      console.log('caught');
    }
  `;
  const { scope } = run(src);
  expect(scope.__parentScope.__stdout).toEqual(
    'good\nloop-start\nerror\ncaught\n'
  );
});

test('try func throw catch', () => {
  const src = `
    function f() {
      console.log('func-start');
      throw 'error';
      console.log('func-end');
    }

    try {
      console.log('good');
      f();
      console.log('bad');
    } catch (e) {
      console.log(e);
      console.log('caught');
    }
  `;
  const { scope } = run(src);
  expect(scope.__parentScope.__stdout).toEqual(
    'good\nfunc-start\nerror\ncaught\n'
  );
});
