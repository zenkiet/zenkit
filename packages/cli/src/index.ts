import { cac } from 'cac';
import pkg from '../package.json' with { type: 'json' };
import { registerIconCommands } from './commands/icons';

const cli = cac('zenkit');

registerIconCommands(cli);

cli.help();
cli.version(pkg.version);

try {
  cli.parse();
} catch (error) {
  console.error(error);
  process.exit(1);
}
