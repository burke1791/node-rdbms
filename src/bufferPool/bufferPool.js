import { filterResults } from '../queryProcessor';
import { writePageToDisk, readPageFromDisk } from '../storageEngine';
import { columnsTableDefinition } from '../system/columns';
import { objectsTableDefinition } from '../system/objects';
import { sequencesTableDefinition } from '../system/sequences';
import { getHeaderValue } from './deserializer';
import Page from './page';
import { serializeRecord } from './serializer';

/**
 * @typedef StorageEngine
 * @property {Function} diskWriter function call to write pages to disk
 * @property {Function} diskReader function call to read pages to disk
 */

/**
 * @typedef BufferPoolConfig
 * @property {Number} [maxPageCount] simulate DB server memory limit by setting a max number of pages allowed in memory. Default is "unlimited"
 * @property {StorageEngine} [storage] interface for reading/writing data pages to disk. Defaults to using the local filesystem
 */

/**
 * @class
 * @param {BufferPoolConfig} config
 */
function BufferPool(config) {

  this.pages = {};
  this.pageCount = 0;
  this.maxPageCount = config.maxPageCount || null;
  this.diskWriter = writePageToDisk;
  this.diskReader = readPageFromDisk;
  
  if (config?.storage?.diskWriter != undefined && config?.storage?.diskReader != undefined) {
    this.diskWriter = config.storage.diskWriter;
    this.diskReader = config.storage.diskReader;
  }

  this.loadPageIntoMemory = (filename, pageId) => {
    const pageData = this.readPageFromDisk(filename, pageId);
    const page = new Page();

    page.initPageFromDisk(pageData);
    this.pages[pageId] = page;

    this.pageCount++;
  }

  this.flushPageToDisk = (pageId) => {
    console.log('flushing page: ' + pageId);
    const page = this.pages[pageId];
    const isWritten = this.writePageToDisk('data', page.data);

    if (!isWritten) {
      console.log('Error writing pageId: ' + pageId);
    }
  }

  this.flushAll = () => {
    const pageIds = Object.keys(this.pages);

    for (let pageId of pageIds) {
      this.flushPageToDisk(pageId);
    }
  }

  /**
   * @method
   * @param {Number} pageId 
   * @param {Array<SqlWhereNode>} predicate
   * @param {Array<ColumnDefinition>} columnDefinitions
   * @param {Array<Array<ResultCell>>} [results]
   * @returns {{Array<Array<ResultCell>>}}
   */
  this.pageScan = (pageId, where, columnDefinitions, results = []) => {
    if (this.pages[pageId] == undefined) {
      this.loadPageIntoMemory('data', pageId);
    }

    const page = this.pages[pageId];

    if (getHeaderValue('pageType', page.header) == '2') {
      throw new Error('Index pages are not supported yet!');
    } else {
      results.push(...page.readPage(columnDefinitions));
      const filteredResults = filterResults(results, where);
      return filteredResults;
    }
  }

  /**
   * @method
   * @param {Number} pageId 
   * @param {Array<UpdatedRecordType>} updatedRecords 
   * @param {Array<ColumnDefinition>} columnDefinitions 
   * @returns {Number}
   */
  this.updateRecords = (pageId, updatedRecords, columnDefinitions) => {
    if (this.pages[pageId] == undefined) {
      this.loadPageIntoMemory('data', pageId);
    }

    const page = this.pages[pageId];

    if (getHeaderValue('pageType', page.header) == '2') {
      throw new Error('Index pages are not supported yet!');
    } else {
      const updateCount = page.updateRecords(updatedRecords, columnDefinitions);
      this.flushPageToDisk(pageId);
      return updateCount;
    }
  }

  /**
   * @method
   * @param {Number} pageId 
   * @param {Array<Array<ColumnValue>>} updatedRecords 
   * @param {Array<ColumnDefinition>} columnDefinitions 
   * @returns {Number}
   */
  this.insertRecords = (pageId, newRecords, columnDefinitions) => {
    console.log(newRecords);
    console.log(columnDefinitions);
    if (this.pages[pageId] == undefined) {
      this.loadPageIntoMemory('data', pageId);
    }

    const page = this.pages[pageId];

    if (getHeaderValue('pageType', page.header) == '2') {
      throw new Error('Index pages are not supported yet!');
    } else {
      let recordCount = 0;
      
      for (let row of newRecords) {
        const serializedRecord = serializeRecord(row, columnDefinitions);
        page.addRecordToPage(serializedRecord);
        recordCount++;
      }
      this.flushPageToDisk(pageId);
      return recordCount;
    }
  }

  /**
   * @method
   * @param {Array<ColumnValue>}
   */
  this.executeSystemObjectInsert = (values) => {
    /**
     * @todo PK check
     */

    const serializedRecord = serializeRecord(values, objectsTableDefinition);

    if (!this.pages[1].hasAvailableSpace(serializedRecord)) {
      throw new Error('Objects page does not have enough space and we cannot do page splits yet');
    }

    this.pages[1].addRecordToPage(serializedRecord);
  }

  /**
   * @method
   * @param {Array<ColumnValue>}
   */
   this.executeSystemSequenceInsert = (values) => {
    /**
     * @todo PK check
     */

    const serializedRecord = serializeRecord(values, sequencesTableDefinition);

    if (!this.pages[2].hasAvailableSpace(serializedRecord)) {
      throw new Error('Sequences page does not have enough space and we cannot do page splits yet');
    }

    this.pages[2].addRecordToPage(serializedRecord);
  }

  /**
   * @method
   * @param {Array<ColumnValue>}
   */
   this.executeSystemColumnInsert = (values) => {
    /**
     * @todo PK check
     */

    const serializedRecord = serializeRecord(values, columnsTableDefinition);

    if (!this.pages[3].hasAvailableSpace(serializedRecord)) {
      throw new Error('Sequences page does not have enough space and we cannot do page splits yet');
    }

    this.pages[3].addRecordToPage(serializedRecord);
  }

}

export default BufferPool;