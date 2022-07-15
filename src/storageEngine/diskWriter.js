import { EMPTY_SPACE_CHAR } from '../constants';
import { padNumber } from '../structs/utilities';
import { writeFile, access } from 'fs/promises';
import fs from 'fs';

/**
 * @typedef PageHeaderConfig
 * @property {Number} [fileId]
 * @property {Number} pageId
 * @property {Number} pageType
 * @property {Number} pageLevel
 * @property {Number} prevPageId
 * @property {Number} nextPageId
 */

/**
 * @class
 */
function DiskWriter() {

  /**
   * @method
   * @param {String} fullFilePath 
   * @param {PageHeaderConfig} pageHeaderConfig 
   * @returns {Boolean}
   */
  this.newFile = async (fullFilePath, pageHeaderConfig) => {
    try {
      let pageData = pageGenerator(true, pageHeaderConfig);
      console.log(pageData.length);

      await writeFile(fullFilePath, pageData);
  
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Generates the text for a new page
   * @function pageGenerator
   * @param {Boolean} hasDbHeader 
   * @param {PageHeaderConfig} pageHeaderConfig 
   */
  function pageGenerator(hasDbHeader, pageHeaderConfig) {
    const pageSize = 13
    let pageText = '';

    if (hasDbHeader) {
      pageText += dbHeaderGenerator(pageSize);
    }

    pageText += pageHeaderGenerator(pageHeaderConfig);

    const currentLength = pageText.length;
    const pageCharSize = Math.pow(2, pageSize);

    pageText += pageEmptySpaceGenerator(pageCharSize - currentLength);

    return pageText;
  }

  /**
   * Generates the text that comprises the DB header portion of a page
   * @function dbHeaderGenerator
   * @param {Number} [pageSize] default: 13
   * @returns {String}
   */
  function dbHeaderGenerator(pageSize = 13) {
    if (String(pageSize).length !== 2) throw new Error('pageSize must be exactly two digits');
    const headerText = `0006${String(pageSize)}`
    return headerText;
  }

  /**
   * Generates the text that comprises the page header
   * @function pageHeaderGenerator.
   * @param {PageHeaderConfig} config
   */
  function pageHeaderGenerator(config) {
    const fileIdText = padNumber(config.fileId || 1, 2);
    const pageIdText = padNumber(config.pageId, 4);
    const pageTypeText = padNumber(config.pageType, 1);
    const pageLevelText = padNumber(config.pageLevel, 2);
    const prevPageIdText = padNumber(config.prevPageId, 4);
    const nextPageIdText = padNumber(config.nextPageId, 4);

    return `${fileIdText}${pageIdText}${pageTypeText}${pageLevelText}${prevPageIdText}${nextPageIdText}0000000000000000`
  }

  /**
   * Generates a string of repeating EMPTY_SPACE_CHARs to fill up the remainder of a new page
   * @function pageEmptySpaceGenerator
   * @param {Number} charactersNeeded
   * @returns {String}
   */
  function pageEmptySpaceGenerator(charactersNeeded) {
    let str = ''

    for (let i = 0; i < charactersNeeded; i++) {
      str += EMPTY_SPACE_CHAR;
    }

    return str;
  }
}

export default DiskWriter;