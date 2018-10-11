const to = chr => str => str.replace(/./g, chr);
const dash = to('-');
const up = to('^');

module.exports = class CompileError extends Error {
  constructor(e, ctx) {
    const source = ctx.source;
    const { pos, line, char, len } = ctx.itr.loc;

    let leftPos = pos;
    let left = '';
    while (leftPos > pos - 80 && leftPos > 0 && source[leftPos - 1] !== '\n') {
      leftPos--;
      left = source[leftPos] + left;
    }

    let token = source.substr(pos, len);

    let rightPos = pos + len - 1;
    let right = '';
    while (
      rightPos < pos + len + 80 &&
      rightPos < source.length - 1 &&
      source[rightPos + 1] !== '\n'
    ) {
      rightPos++;
      right = right + source[rightPos];
    }

    const str = `\n${left}${token}${right}
${dash(left)}${up(token)}${dash(right)}
${e.message} at ${line}:${char}`;
    super(str);
    this.pos = pos;
    this.line = line;
    this.char = char;
  }
};
