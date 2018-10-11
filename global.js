const util = require('util');
const { NativeCode } = require('./ast/Function');
const Literal = require('./ast/Literal');
const StorageSlot = require('./ast/helpers/StorageSlot');

module.exports = options => {
  const global = {
    __streams: {
      stdout: ''
    },
    console: wrap({
      log: scope => {
        const result = util.format(...unWrap(scope.getSlot('arguments')));
        if (!options.noStdout) {
          process.stdout.write(`console.log:>${result}\n`);
        }
        global.__streams.stdout += `${result}\n`;
      }
    }),
    RegExp: wrap({ name: 'RegExp' })
  };
  return global;

  function wrap(x) {
    if (typeof x === 'string') {
      return new Literal(x);
    } else if (typeof x === 'function') {
      return new NativeCode(x);
    } else {
      const data = Object.entries(x).reduce((d, [k, v]) => {
        d[k] = wrap(v);
        return d;
      }, {});
      return new StorageSlot(data);
    }
  }

  function unWrap(x) {
    if (Array.isArray(x.data)) {
      return x.data.map(y => unWrap(y));
    } else if (typeof x.data === 'object') {
      return Object.entries(x.data).reduce((d, [k, v]) => {
        d[k] = v.data;
        return d;
      }, {});
    } else {
      return x.data;
    }
  }
};
