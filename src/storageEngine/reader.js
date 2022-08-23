import { getLocalStorage } from '../../utilities';
import { PAGE_SIZE } from '../utilities/constants';

/**
 * @function
 * @param {String} filename 
 * @param {Number} pageId 
 * @returns {String}
 */
export function readPageFromDisk(filename, pageId) {
  const data = getLocalStorage(filename, JSON.parse);
  const pageStart = (pageId - 1) * PAGE_SIZE;
  const page = data.substring(pageStart, pageStart + PAGE_SIZE);
  
  return page;
}

/**
 * @function
 * @param {String} filename 
 * @returns {Boolean}
 */
export function fileExists(filename) {
  const data = getLocalStorage(filename);

  if (data == null) return false;

  return true;
}