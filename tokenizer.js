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
  function* tokens() {
    let pos = 0;
    const len = source.length;

    const peek = () => source[pos];
    const read = () => {
      return source[pos++];
    };
    const skip = () => {
      pos++;
    };

    const readWhiteSpace = () => {
      while (isWhiteSpace(peek())) {
        skip();
      }
    };

    const readNewLine = () => {
      while (isNewLine(peek())) {
        skip();
      }
      return { v: '\n', t: 'newLine' };
    };

    const readIdentifier = () => {
      let identifier = read();
      while (isIdentifierPart(peek())) {
        identifier += read();
      }
      return { v: identifier, t: 'identifier' };
    };

    const readNumber = () => {
      let number = read();
      while (isNumber(peek())) {
        number += read();
      }
      return { v: number, t: 'number' };
    };

    const readSymbol = () => {
      let symbol = read();
      // if (!isSingleSymbol(symbol)) {
      //   while (isSymbol(peek())) {
      //     symbol += read();
      //   }
      // }
      while (isSymbol(symbol + peek())) {
        symbol += read();
      }
      return { v: symbol, t: 'symbol' };
    };

    const readString = quote => {
      read();
      let string = '';
      while (peek() !== quote && pos < len) {
        let nextChar = read();
        if (nextChar === '\\') {
          let escape = read();
          nextChar = escpaeSeq[escape] || escape;
        }
        string += nextChar;
      }
      if (pos === len) {
        throw new Error('Unterminated string');
      }
      read();
      return { v: string, t: 'string' };
    };

    while (pos < len) {
      let next = peek();

      if (isWhiteSpace(next)) {
        readWhiteSpace();
      } else if (isNewLine(next)) {
        yield readNewLine();
      } else if (isIdentifier(next)) {
        yield readIdentifier();
      } else if (isNumber(next)) {
        yield readNumber();
      } else if (isSymbol(next)) {
        yield readSymbol();
      } else if (isString(next)) {
        yield readString(next);
      } else {
        throw new Error(`Eh? »${peek()}« ` + peek().charCodeAt(0));
      }
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

  const res = {
    value,
    peek: value,
    done: false
  };

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

const wrappers = '[]{}()';
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
