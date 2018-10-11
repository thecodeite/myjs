const tokenize = require('./tokenizer');

module.exports = class ParsingContext {
  constructor(source) {
    this.source = source;
    this.itr = tokenize(source);
    this.noIn = [];
  }

  dlog(...args) {
    process.env.DEBUG === 'true' && console.log(...args);
  }

  skipEmptyLines() {
    while (this.itr.peek.t === 'newLine') this.itr.read();
  }

  skipSemi() {
    if (this.itr.peek.v === ';') this.itr.read(';');
  }
};
