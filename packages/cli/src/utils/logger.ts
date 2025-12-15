import { intro, log, outro, spinner } from '@clack/prompts';
import pc from 'picocolors';

export const logger = {
  intro: () => intro(pc.bgCyan(pc.black(' ZENKIT CLI '))),
  outro: (msg: string) => outro(msg),
  step: (msg: string) => log.step(msg),
  error: (msg: string) => log.error(pc.red(msg)),
  success: (msg: string) => log.success(pc.green(msg)),
  warn: (msg: string) => log.warn(pc.yellow(msg)),
  info: (msg: string) => log.info(pc.blue(msg)),
  spinner: () => spinner(),
};

export function handleError(err: unknown) {
  if (err instanceof Error) {
    logger.error(err.message);
  } else {
    logger.error('An unknown error occurred');
  }
  process.exit(1);
}
