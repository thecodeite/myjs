const CompileError = require('./CompileError');

module.exports = class NotImplementedError extends CompileError {
  constructor(msg, ...rest) {
    super(`NotImplemented: ${msg}`, ...rest);
  }
};
