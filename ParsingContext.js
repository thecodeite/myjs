module.exports = class ParsingContext {
  constructor(itr) {
    this.itr = itr;
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
