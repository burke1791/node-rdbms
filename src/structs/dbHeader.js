import { padNumber } from './utilities';

/**
 * @class DbHeader
 * @param {String} data
 */
function DbHeader(data) {

  this.headerCharCountSize = 4;
  this.pageCharCountSize = 2;

  this.headerCharCount = parseHeaderCharCount(data);
  this.pageCharCount = parsePageCharCount(data);

  function parseHeaderCharCount(data) {
    return data.length;
  }

  function parsePageCharCount(data) {
    return Number(data.substring(4, 6));
  }

  this.getHeaderCharCountText = () => {
    return padNumber(this.headerCharCount, this.headerCharCountSize);
  }

  this.getPageCharCountText = () => {
    return padNumber(this.pageCharCount, this.pageCharCountSize);
  }

  this.getDbHeaderText = () => {
    return this.getHeaderCharCountText() + this.getPageCharCountText();
  }
}

export default DbHeader;