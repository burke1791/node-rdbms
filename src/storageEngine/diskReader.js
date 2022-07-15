import { access, readFile } from 'fs/promises';
import fs from 'fs';
import { PAGE_SIZE } from '../constants';

/**
 * @class
 */
function DiskReader() {

  /**
   * Checks if the provided database file exists
   * @function
   * @param {String} filename 
   * @returns {Boolean}
   */
   this.databaseFileExists = async (filename) => {
    try {
      await access(filename, fs.constants.F_OK);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Returns the text of the provided pageId. Throws an error if the page does not exist
   * @function
   * @param {String} filename
   * @param {Number} pageId
   * @returns {(String)}
   */
  this.readPageFromDisk = async (filename, pageId) => {
    try {
      const fileData = await readFile(filename, { encoding: 'utf8' });
      const pageStartChar = PAGE_SIZE * (pageId - 1);
  
      const pageData = fileData.substring(pageStartChar, pageStartChar + PAGE_SIZE - 1);

      if (pageData === '') {
        throw new Error(`pageId: ${pageId} does not exist`);
      }
  
      return pageData;
    } catch (error) {
      console.log(error);
      throw new Error('Unable to read page from disk');
    }
  }
}

export default DiskReader;