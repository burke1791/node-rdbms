import { getLocalStorage, setLocalStorage } from '../../utilities';
import { getHeaderValue } from '../bufferPool/deserializer';
import { PAGE_HEADER_SIZE, PAGE_SIZE } from '../utilities/constants';
import { fileExists } from './reader';

/**
 * @function
 * @param {String} filename 
 * @param {String} data 
 * @returns {Boolean}
 */
export function writePageToDisk(filename, data) {
  if (data.length != PAGE_SIZE) throw new Error('Pages must be exactly ' + PAGE_SIZE + ' characters long');

  let fileData = data;

  if (fileExists(filename)) {
    console.log('file exists');
    const file = getLocalStorage(filename, JSON.parse);
    const header = data.substring(0, PAGE_HEADER_SIZE);
    const pageId = getHeaderValue('pageId', header);
    const before = file.substring(0, (pageId - 1) * PAGE_SIZE);
    const after = file.substring(pageId * PAGE_SIZE);
    fileData = `${before}${data}${after}`;
  }

  setLocalStorage(filename, fileData);

  return true;
}