const isWhiteSpace = c => ' \t'.includes(c);
const isNewLine = c => '\r\n'.includes(c);
const isIdentifier = c => c && /[a-zA-Z_]/.test(c);
const isIdentifierPart = c => c && /[a-zA-Z0-9_]/.test(c);
const isNumber = c => c && '0123456789'.includes(c);
// const isSymbol = c => c && '=;:,.+-*/%](){}[]'.includes(c);
// const isSingleSymbol = c => c && '(){}[]:'.includes(c);
const isSymbol = chars => chars && symbols.some(x => x.startsWith(chars));
const isString = c => c && '\'"'.includes(c);

const debug = () => process.env.DEBUG === 'true';
const dlog = (...args) => debug() && console.log(...args);

class ParsingError extends Error {
  constructor(str, source, pos, line, char) {
    let leftPos = pos;
    let left = '';
    while (leftPos > pos - 80 && leftPos > 0 && source[leftPos - 1] !== '\n') {
      leftPos--;
      left = source[leftPos] + left;
    }

    let rightPos = pos;
    let right = '';
    while (
      rightPos < pos + 80 &&
      rightPos < source.length &&
      source[rightPos + 1] !== '\n'
    ) {
      rightPos++;
      right = right + source[rightPos];
    }
    str += ` at ${line}:${char}`;
    str += '\n' + left + source[pos] + right;
    str += '\n' + left.replace(/./g, '-') + '^' + left.replace(/./g, '-');
    super(str);
  }
}

const escpaeSeq = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  v: '\v',
  '0': '\0'
};

module.exports = function tokenize(source) {
  const res = {
    pos: 0,
    line: 1,
    char: 1
  };
  res.loc = { pos: res.pos, line: res.line, char: res.char, len: 1 };

  function* tokens() {
    const len = source.length;

    let p;
    let prev;
    const peek = () => source[res.pos];
    const read = () => {
      if (res.pos > source.length) {
        throw new Error('Read passed end of input');
      }
      const val = source[res.pos];

      if (val === '\n') {
        res.line++;
        res.char = 1;
      } else {
        res.char++;
      }

      res.pos++;
      p = source[res.pos];
      return val;
    };

    const skipWhiteSpace = () => {
      while (isWhiteSpace(peek())) {
        read();
      }
    };

    const readNewLine = () => {
      while (isNewLine(peek())) {
        read();
      }
      prev = { v: '\n', t: 'newLine' };
      return prev;
    };

    const readIdentifier = () => {
      let identifier = read();
      while (isIdentifierPart(peek())) {
        identifier += read();
      }
      prev = { v: identifier, t: 'identifier' };
      return prev;
    };

    const readNumber = () => {
      let number = read();
      while (isNumber(peek())) {
        number += read();
      }
      prev = { v: number, t: 'number' };
      return prev;
    };

    const readSymbol = () => {
      let symbol = read();

      if (symbol === '/') {
        if (peek() === '/') {
          return readSingleLineComment();
        } else if (peek() === '*') {
          return readMultiLineComment();
        } else if (prev.t !== 'number' && prev.t !== 'identifier') {
          return readRegExp();
        }
      }

      while (isSymbol(symbol + peek())) {
        symbol += read();
      }
      prev = { v: symbol, t: 'symbol' };
      return prev;
    };

    const readRegExp = () => {
      let pattern = '';
      while (peek() !== '/') {
        if (peek() === '\\') {
          read('\\');
        }
        pattern += read();
      }

      read('/');

      let flags = '';
      while ('gimsuy'.includes(peek())) {
        flags += read();
      }

      return { v: pattern, f: flags, t: 'regexp' };
    };

    const readSingleLineComment = () => {
      read('/');
      while (!isNewLine(peek())) {
        read();
      }
      readNewLine();
      return null;
    };

    const readMultiLineComment = () => {
      read('*');
      while (!(read() === '*' && peek() === '/'));
      read('/');
      if (isNewLine(peek())) {
        readNewLine();
      }
      return null;
    };

    const readString = quote => {
      read();
      let string = '';
      while (peek() !== quote && res.pos < len) {
        let nextChar = read();
        if (nextChar === '\\') {
          let escape = read();
          nextChar = escpaeSeq[escape] || escape;
        }
        string += nextChar;
      }
      if (res.pos === len) {
        throw new ParsingError(
          'Unterminated string',
          source,
          res.pos,
          res.line,
          res.char
        );
      }
      read();
      prev = { v: string, t: 'string' };
      return prev;
    };

    while (' \t\n\r'.includes(peek())) {
      read();
    }

    while (res.pos < len) {
      let next = peek();
      res.loc = { pos: res.pos, line: res.line, char: res.char, len: 1 };
      let token = null;
      if (isIdentifier(next)) {
        token = readIdentifier();
      } else if (isNumber(next)) {
        token = readNumber();
      } else if (isSymbol(next)) {
        token = readSymbol();
      } else if (isString(next)) {
        token = readString(next);
      } else {
        throw new ParsingError(
          `Unexpected character? »${JSON.stringify(peek())}« ` +
            peek().charCodeAt(0),
          source,
          res.pos,
          res.line,
          res.char
        );
      }

      if (token) {
        res.loc.len = token.v.length;
        skipWhiteSpace();
        if (isNewLine(peek())) {
          readNewLine();
          token.eol = true;
        }
        yield token;
      }
      skipWhiteSpace();
    }
  }

  const itr = tokens();

  if (itr.done) {
    return {
      next() {
        return null;
      },
      done: trye
    };
  }

  let { value } = itr.next();

  res.value = value;
  res.peek = value;
  res.done = value === undefined;

  res.peek = value;
  res.next = () => {
    let read = res.value;
    const n = itr.next();
    // console.log('n:', n);
    let { value, done } = n;
    res.done = done;
    res.value = res.peek = value || { v: null, t: null };
    return { value: read, done: res.done };
  };
  res.read = expected => {
    const { value } = res.next();
    if (Array.isArray(expected)) {
      if (!expected.includes(value.v))
        throw new Error(
          `Read error expected: »${expected}«   actual: »${value.v}«`
        );
    } else if (expected !== undefined) {
      if (value.v !== expected)
        throw new Error(
          `Read error expected: »${expected}«   actual: »${value.v}«`
        );
    }
    dlog('read:', value, expected);
    return value.v;
  };
  res[Symbol.iterator] = () => res;
  res.hasNext = () => itr.done;

  return res;
};

const wrappers = '[]{}()?';
const math = '+-/*%';
const logical = ['&&', '||'];
const assignment = [
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '&=',
  '|=',
  '^=',
  '++',
  '--',
  '<<=',
  '>>=',
  '>>>='
];
const punctuation = [';', ',', '.', ':'];
const comparison = ['<', '>', '<=', '>=', '==', '==='];
const bitwise = ['&', '|', '^', '<<', '>>', '>>>'];
const unary = ['++', '--', '+', '-', '~', '!'];

const symbols = [
  ...wrappers,
  ...math,
  ...logical,
  ...assignment,
  ...punctuation,
  ...comparison,
  ...bitwise,
  ...unary
];

module.exports.ParsingError = ParsingError;
