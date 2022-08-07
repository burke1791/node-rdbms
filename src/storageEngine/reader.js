import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { PAGE_SIZE } from '../utilities/constants';

/**
 * @function
 * @param {String} filename 
 * @param {Number} pageId 
 * @returns {String}
 */
export async function readPageFromDisk(filename, pageId) {
  const fullFilename = path.resolve(__dirname, `data/${filename}.ndb`);

  try {
    const data = await readFile(fullFilename, { encoding: 'utf-8' });
    const pageStart = (pageId - 1) * PAGE_SIZE;
    const page = data.substring(pageStart, pageStart + PAGE_SIZE);
    return page;
  } catch (error) {
    return false;
  }
}

/**
 * @function
 * @param {String} filename
 * @returns {Boolean}
 */
export async function fileExists(filename) {
  const fullFilename = path.resolve(__dirname, `data/${filename}.ndb`);

  return existsSync(fullFilename);
}