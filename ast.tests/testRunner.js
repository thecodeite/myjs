const Program = require('../ast/Program');
const ParsingContext = require('../ParsingContext');
const { createRootScope, unlockScope } = require('../ast/helpers/Scope');

process.env.DEBUG = 'false';

module.exports = function run(src) {
  const context = new ParsingContext(src);
  const program = Program.read(context);
  const scope = createRootScope({ noStdout: true });
  program.run(scope);
  unlockScope();
  return {
    context,
    scope
  };
};
