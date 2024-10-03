import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import type { BunFile } from "bun";

export type CacheID = string;
export type CacheItem = BunFile;
export type CacheCategory = string;
export type Cache = Record<CacheCategory, CacheItem>;

const CWD = process.cwd();
const CACHE_DIR = join(CWD, "_cache");

export function read(id: CacheID, keys: CacheCategory[]): Cache {
  if (!existsSync(CACHE_DIR)) throw new Error("cache not initialized");
  if (keys.length === 0) throw new Error("no keys");

  const dir = join(CACHE_DIR, id);
  const availableFiles = readdirSync(dir);

  const availableCategories = availableFiles.map((file) =>
    basename(file, extname(file)),
  );

  const categories = keys.filter((key) => availableCategories.includes(key));
  if (categories.length !== keys.length) throw new Error("invalid keys");

  const data: Cache = {};

  for (const category of categories) {
    const filename = availableFiles.find(
      (file) => basename(file, extname(file)) === category,
    );
    const file = Bun.file(join(dir, filename));
    data[category] = file;
  }

  return data;
}
