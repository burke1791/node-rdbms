import { PAGE_HEADER_SIZE, PAGE_SIZE } from '../utilities/constants';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getHeaderValue } from '../bufferPool/deserializer';

/**
 * @function
 * @param {String} filename
 * @param {String} data 
 * @returns {Boolean}
 */
export async function writePageToDisk(filename, data) {
  if (data.length != PAGE_SIZE) throw new Error('Pages must be exactly ' + PAGE_SIZE + ' characters long');

  const filename = path.resolve(__dirname, `data/${filename}.ndb`);

  try {
    let fileData;

    if (!existsSync(path.resolve(__dirname, 'data'))) {
      mkdirSync(path.resolve(__dirname, 'data'));
    }

    if (existsSync(filename)) {
      const file = await readFile(filename, { encoding: 'utf-8' });
      const header = data.substring(0, PAGE_HEADER_SIZE);
      const pageId = getHeaderValue('pageId', header);
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