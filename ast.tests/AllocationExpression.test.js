const run = require('./testRunner.js');

test('new Person', () => {
  const src = `
  function Person(name) {
    this.name = name;
    this.genus = 'Homo Sapien'
  }

  var bob = new Person;
  var x = bob.name;
  var y = bob.genus;
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(undefined);
  expect(scope.y.data).toEqual('Homo Sapien');
});

test('new Person()', () => {
  const src = `
  function Person(name) {
    this.name = name;
    this.genus = 'Homo Sapien'
  }

  var bob = new Person();
  var x = bob.name;
  var y = bob.genus;
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual(undefined);
  expect(scope.y.data).toEqual('Homo Sapien');
});

test('new Person("bob")', () => {
  const src = `
  function Person(name) {
    this.name = name;
    this.genus = 'Homo Sapien'
  }

  var bob = new Person('bob')
  var x = bob.name
  var y = bob.genus
  `;
  const { scope } = run(src);
  expect(scope.x.data).toEqual('bob');
  expect(scope.y.data).toEqual('Homo Sapien');
});
