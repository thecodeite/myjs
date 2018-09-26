module.exports = class NotImplementedError extends Error {
  constructor(msg, ...rest) {
    super(`NotImplemented: ${msg}`, ...rest);
  }
};
