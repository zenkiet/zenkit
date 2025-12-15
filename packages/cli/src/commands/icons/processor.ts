import {
  cleanupSVG,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO,
} from '@iconify/tools';
import { pathExists, resolvePath, writeJSON } from '../../utils/fs';
import { logger } from '../../utils/logger';

export interface IconBuildOptions {
  source: string;
  output: string;
  prefix: string;
  dryRun?: boolean;
}

export async function processIcons(options: IconBuildOptions) {
  const s = logger.spinner();

  const absoluteSource = resolvePath(options.source);
  const absoluteOutput = resolvePath(options.output);

  if ((await pathExists(absoluteSource)) === false) {
    throw new Error(`Source directory not found: ${absoluteSource}`);
  }

  // 1. Import Icons
  s.start(`Importing SVGs from ${options.source}...`);

  let iconSet;
  try {
    iconSet = await importDirectory(absoluteSource, {
      prefix: options.prefix,
    });
  } catch (error) {
    s.stop('Failed to import directory');
    throw error;
  }

  const count = iconSet.count();
  if (count === 0) {
    s.stop('No icons found.');
    return { count: 0 };
  }

  s.message(`Found ${count} icons. Processing & Optimizing...`);

  // 2. Validate & Optimize
  const icons = iconSet.list();

  for (const name of icons) {
    const svg = iconSet.toSVG(name);
    if (!svg) {
      iconSet.remove(name);
      continue;
    }

    try {
      cleanupSVG(svg);
      runSVGO(svg, {
        plugins: ['removeDimensions', 'convertStyleToAttrs'],
      });

      await parseColors(svg, {
        defaultColor: 'currentColor',
        callback: (attr, colorStr, color) => {
          if (color && !isEmptyColor(color)) {
            return 'currentColor';
          }
          return colorStr;
        },
      });

      iconSet.fromSVG(name, svg);
    } catch (err) {
      logger.warn(`Skipping invalid icon: ${name}`);
      iconSet.remove(name);
    }
  }

  // 3. Export
  if (!options.dryRun) {
    s.message('Saving JSON bundle...');
    const exported = iconSet.export();

    await writeJSON(absoluteOutput, exported);

    s.stop(`Done! Bundle saved to ${options.output}`);
  } else {
    s.stop(`Dry run complete. Processed ${count} icons (No file written).`);
  }

  return { count: iconSet.count() };
}
