import { padNumber } from './utilities';

/**
 * @class PageHeader
 * @param {String} data 
 */
function PageHeader(data) {

  this.fileIdCharCount = 2;
  this.pageIdCharCount = 4;
  this.pageTypeCharCount = 1;
  this.pageLevelCharCount = 2;
  this.prevPageIdCharCount = 4;
  this.nextPageIdCharCount = 4;
  this.recordCountCharCount = 4;
  this.freeCountCharCount = 4;
  this.reservedCountCharCount = 4;
  this.firstFreeDataCharCount = 4;

  this.fileId = parseFileId(data);
  this.pageId = parsePageId(data);
  this.pageType = parsePageType(data);
  this.pageLevel = parsePageLevel(data);
  this.prevPageId = parsePrevPageId(data);
  this.nextPageId = parseNextPageId(data);
  this.recordCount = parseRecordCount(data);
  this.freeCount = parseFreeCount(data);
  this.reservedCount = parseReservedCount(data);
  this.firstFreeData = parseFirstFreeData(data);

  function parseFileId(data) {
    // first 2 chars of data
    return Number(data.substring(0, 2));
  }

  function parsePageId(data) {
    // next 4 chars of data
    return Number(data.substring(2, 6));
  }

  function parsePageType(data) {
    // next 1 char of data
    return Number(data.substring(6, 7));
  }

  function parsePageLevel(data) {
    // next 2 chars of data
    return Number(data.substring(7, 9));
  }

  function parsePrevPageId(data) {
    // next 4 chars of data
    return Number(data.substring(9, 13));
  }

  function parseNextPageId(data) {
    // next 4 chars of data
    return Number(data.substring(13, 17));
  }

  function parseRecordCount(data) {
    // next 4 chars of data
    return Number(data.substring(17, 21));
  }

  function parseFreeCount(data) {
    // next 4 chars of data
    return Number(data.substring(21, 25));
  }

  function parseReservedCount(data) {
    // next 4 chars of data
    return Number(data.substring(25, 29));
  }

  function parseFirstFreeData(data) {
    // next 4 chars of data
    return Number(data.substring(29, 33));
  }

  this.getFileIdText = () => {
    return padNumber(this.fileId, this.fileIdCharCount);
  }

  this.getPageIdText = () => {
    return padNumber(this.pageId, this.pageIdCharCount);
  }

  this.getPageTypeText = () => {
    return padNumber(this.pageType, this.pageTypeCharCount);
  }

  this.getPageLevelText = () => {
    return padNumber(this.pageLevel, this.pageLevelCharCount);
  }

  this.getPrevPageIdText = () => {
    return padNumber(this.prevPageId, this.prevPageIdCharCount);
  }

  this.getNextPageIdText = () => {
    return padNumber(this.nextPageId, this.nextPageIdCharCount);
  }

  this.getRecordCountText = () => {
    return padNumber(this.recordCount, this.recordCountCharCount);
  }

  this.getFreeCountText = () => {
    return padNumber(this.freeCount, this.freeCountCharCount);
  }

  this.getReservedCountText = () => {
    return padNumber(this.reservedCount, this.reservedCountCharCount);
  }

  this.getFirstFreeDataText = () => {
    return padNumber(this.firstFreeData, this.firstFreeDataCharCount);
  }

  this.getPageHeaderText = () => {
    return this.getFileIdText() +
           this.getPageIdText() +
           this.getPageTypeText() +
           this.getPageLevelText() +
           this.getPrevPageIdText() +
           this.getNextPageIdText() +
           this.getRecordCountText() +
           this.getFreeCountText() +
           this.getReservedCountText() +
           this.getFirstFreeDataText();
  }
}

export default PageHeader;