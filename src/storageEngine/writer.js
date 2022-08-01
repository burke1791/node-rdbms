import { PAGE_SIZE } from '../utilities/constants';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * @function
 * @param {Number} fileId 
 * @param {Number} pageId 
 * @param {String} data 
 * @returns {Boolean}
 */
export async function writePageToDisk(fileId, pageId, data) {
  if (data.length != PAGE_SIZE) throw new Error('Pages must be exactly ' + PAGE_SIZE + ' characters long');

  const filename = path.resolve(__dirname, `data/${fileId}.ndb`);

  try {
    let fileData;

    if (!existsSync(path.resolve(__dirname, 'data'))) {
      mkdirSync(path.resolve(__dirname, 'data'));
    }

    if (existsSync(filename)) {
      const file = await readFile(filename, { encoding: 'utf-8' });
      const before = file.substring(0, (pageId - 1) * PAGE_SIZE);
      const after = file.substring(pageId * PAGE_SIZE);
      fileData = `${before}${data}${after}`;
    } else {
      fileData = data;
    }

    await writeFile(filename, fileData, { encoding: 'utf-8' });
    
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}