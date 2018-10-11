const fs = require('fs');
const tokenize = require('./tokenizer');
const ParsingContext = require('./ParsingContext');
const { createRootScope } = require('./ast/helpers/Scope');
const CompileError = require('./ast/helpers/CompileError');
const Program = require('./ast/Program');
const programPath = process.argv[2];

try {
  const src = fs.readFileSync(programPath, 'utf8');

  console.log('[...tokenize(src)]:', [...tokenize(src)]);
  const context = new ParsingContext(src);
  const program = Program.read(context);
  console.log('ast: \n' + program.toStringAll());
} catch (e) {
  if (e instanceof CompileError) {
    console.log(`run failed at ${programPath}:${e.line}:${e.char}`);
  }
  throw e;
}

// const scope = createRootScope();
// console.log('result: \n' + program.run(scope));
// console.log('context.scope:', JSON.stringify(scope, null, '  '));
