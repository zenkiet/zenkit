import { constants } from 'node:fs';
import {
  access,
  mkdir,
  readFile as nodeReadFile,
  writeFile as nodeWriteFile,
  rm,
  stat,
} from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export function resolvePath(...paths: string[]): string {
  return resolve(process.cwd(), ...paths);
}

export async function pathExists(path: string): Promise<boolean> {
  return await access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export async function isDirectory(path: string): Promise<boolean> {
  return await stat(path)
    .then((stats) => stats.isDirectory())
    .catch(() => false);
}

export async function isFile(path: string): Promise<boolean> {
  return await stat(path)
    .then((stats) => stats.isFile())
    .catch(() => false);
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  if (!(await pathExists(dirPath))) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function writeFile(
  path: string,
  content: string | Buffer,
): Promise<void> {
  const absolutePath = resolvePath(path);
  await ensureDirectory(dirname(absolutePath));
  await nodeWriteFile(absolutePath, content, 'utf-8');
}

export async function readFile(path: string): Promise<string> {
  return nodeReadFile(resolvePath(path), 'utf-8');
}

export async function readJSON<T = unknown>(path: string): Promise<T> {
  const content = await readFile(path);
  try {
    return JSON.parse(content) as T;
  } catch (error: unknown) {
    throw new Error(`Failed to parse JSON from ${path}`, { cause: error });
  }
}

export async function writeJSON(
  path: string,
  data: unknown,
  spaces = 2,
): Promise<void> {
  const content = JSON.stringify(data, null, spaces);
  await writeFile(path, content);
}

export async function remove(path: string): Promise<void> {
  const absolutePath = resolvePath(path);
  if (await pathExists(absolutePath)) {
    await rm(absolutePath, { recursive: true, force: true });
  }
}
