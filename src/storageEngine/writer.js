import { PAGE_SIZE } from '../utilities/constants';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

/**
 * @function
 * @param {Number} fileId 
 * @param {Number} pageId 
 * @param {String} data 
 * @returns {Boolean}
 */
export async function flushPageToDisk(fileId, pageId, data) {
  if (data.length != PAGE_SIZE) throw new Error('Pages must be exactly ' + PAGE_SIZE + ' characters long');

  const filename = path.resolve(__dirname, `data/${fileId}.ndb`);

  try {
    const file = await readFile(filename, { encoding: 'utf-8' });
    const before = file.substring(0, (pageId - 1) * PAGE_SIZE);
    const after = file.substring(pageId * PAGE_SIZE);
    const newFile = `${before}${data}${after}`;

    await writeFile(filename, newFile, { encoding: 'utf-8' });
    
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}