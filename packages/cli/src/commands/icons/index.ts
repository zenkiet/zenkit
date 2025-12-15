import { CAC } from 'cac';
import pc from 'picocolors';
import { handleError, logger } from '../../utils/logger';
import { processIcons } from './processor';

export function registerIconCommands(cli: CAC) {
  cli
    .command('icons <source>', 'Compile SVG icons to Iconify JSON')
    .option('-o, --output <path>', 'Output JSON file path', {
      default: 'src/lib/assets/icons.json',
    })
    .option('-p, --prefix <name>', 'Icon set prefix', {
      default: 'zen',
    })
    .option('--dry-run', 'Run without writing file')
    .action(async (source, options) => {
      logger.intro();

      try {
        const start = performance.now();

        const result = await processIcons({
          source,
          output: options.output,
          prefix: options.prefix,
          dryRun: options.dryRun,
        });

        const duration = ((performance.now() - start) / 1000).toFixed(2);

        logger.success(
          `Successfully compiled ${pc.bold(result.count.toString())} icons in ${duration}s`,
        );
      } catch (err) {
        handleError(err);
      } finally {
        logger.outro("You're all set!");
      }
    });
}
