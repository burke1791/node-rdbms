import { readFile } from 'fs/promises';
import { PAGE_SIZE } from '../utilities/constants';

/**
 * @function
 * @param {Number} fileId 
 * @param {Number} pageId 
 * @returns {String}
 */
export async function readPageFromDisk(fileId, pageId) {
  const fileName = `data/${fileId}.ndb`;

  try {
    const data = await readFile(fileName, { encoding: 'utf-8' });
    const pageStart = (pageId - 1) * PAGE_SIZE;
    const page = data.substring(pageStart, pageStart + PAGE_SIZE);
    return page;
  } catch (error) {
    return false;
  }
}