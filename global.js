const util = require('util');

module.exports = (NativeCode, StorageSlot) => {
  const global = {
    console: wrap({
      log: scope => {
        const result = util.format(...unWrap(scope.arguments));
        process.stdout.write(`console.log:>${result}\n`);
        global.__stdout += `${result}\n`;
      }
    }),
    __stdout: ''
  };
  return global;

  function wrap(x) {
    if (typeof x === 'function') {
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
