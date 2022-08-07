import { writePageToDisk, readPageFromDisk } from '../storageEngine';
import { columnsTableDefinition } from '../system/columns';
import { getTableObjectByName, objectsTableDefinition } from '../system/objects';
import { sequencesTableDefinition } from '../system/sequences';
import { isDuplicateKey } from './constraints';
import { getHeaderValue } from './deserializer';
import Page from './page';
import { generateBlankPage, serializeRecord } from './serializer';

/**
 * @class
 * @param {Number} maxPageCount
 */
function BufferPool(maxPageCount) {

  this.pages = {};
  this.pageCount = 0;
  this.maxPageCount = maxPageCount;

  this.loadPageIntoMemory = async (filename, pageId) => {
    const pageData = await readPageFromDisk(filename, pageId);
    const page = new Page();

    page.initPageFromDisk(pageData);
    this.pages[pageId] = page;

    this.pageCount++;
  }

  this.flushPageToDisk = async (pageId) => {
    const page = this.pages[pageId];
    const isWritten = writePageToDisk('data', page.data);

    if (!isWritten) {
      console.log('Error writing pageId: ' + pageId);
    }
  }

  this.flushAll = async () => {
    const pageIds = Object.keys(this.pages);

    for (let pageId of pageIds) {
      const page = this.pages[pageId];
      const isWritten = writePageToDisk('data', page.data);

      if (!isWritten) {
        console.log('Error writing pageId: ' + pageId);
      }
    }
  }

  /**
   * @method
   * @param {Number} pageId 
   * @param {Array<SimplePredicate>} predicate
   * @param {Array<Array<ResultCell>>} [results]
   * @returns {{Array<Array<ResultCell>>}}
   */
  this.scan = async (pageId, predicate, results = []) => {
    if (this.pages[pageId] == undefined) {
      await this.loadPageIntoMemory('data', pageId);
    }

    const page = this.pages[pageId];

    if (getHeaderValue('pageType', page.header) == '2') {
      throw new Error('Index pages are not supported yet!');
    } else {
      results.push(...page.select(predicate));
      return results;
    }
  }

  /**
   * @method
   * @param {String} schemaName 
   * @param {String} tableName 
   * @param {Array<SimplePredicate>} predicate 
   * @returns {Array<Array<ResultCell>>}
   */
  this.executeSelect = async (schemaName, tableName, predicate) => {
    /*
      1. Find the root_page_id for the provided [schema].[table] from the system objects table
      2. Scan the page for records while evaluating the predicate
    */

    let rootPageId = 1;
    let results = [];
  
    if (schemaName != 'sys' && tableName != 'objects') {
      const objectRecord = getTableObjectByName(this, schemaName, tableName);
      rootPageId = objectRecord.find(col => col.name.toLowerCase() === 'root_page_id').value;
    }
    
    results = await this.scan(rootPageId, predicate, results);

    return results;
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

  // this.executeSystemInsert = (tableName, records) => {
  //   records.forEach(record => {
  //     const pk = Number(record.find(col => col.name.toLowerCase() === 'employeeid').value);

  //     for (let page of this.pages.sys[tableName]) {
  //       if (isDuplicateKey(page, pk)) {
  //         console.log('Duplicate key');
  //         return false;
  //       }
  //     }

  //     let page = this.pages.sys[tableName].find(pg => pg.hasAvailableSpace(record));

  //     if (page == undefined) {
  //       // create a new page
  //       page = new Page(this.tableDefinition);
  //       const blankPage = generateBlankPage(1, this.pageCount + 1, 1);
  //       page.initPageFromDisk(blankPage);
  //       this.pages[tableName].push(page);
  //       this.pageCount++;
  //     }

  //     page.newRecord(record);
  //   });
  // }

  // this.executeInsert = (schemaName, tableName, records) => {
  //   records.forEach(record => {
  //     const pk = Number(record.find(col => col.name.toLowerCase() === 'employeeid').value);

  //     for (let page of this.pages[tableName]) {
  //       if (isDuplicateKey(page, pk)) {
  //         console.log('Duplicate key');
  //         return false;
  //       }
  //     }

  //     let page = this.pages[tableName].find(pg => pg.hasAvailableSpace(record));

  //     if (page == undefined) {
  //       // create a new page
  //       page = new Page(this.tableDefinition);
  //       const blankPage = generateBlankPage(1, this.pageCount + 1, 1);
  //       page.initPageFromDisk(blankPage);
  //       this.pages[tableName].push(page);
  //       this.pageCount++;
  //     }

  //     page.newRecord(record);
  //   });
  // }

  // /**
  //  * @method
  //  * @param {String} schemaName
  //  * @param {String} tableName
  //  * @param {Array<SimplePredicate>} predicate 
  //  * @returns {Array<Array<ResultCell>>}
  //  */
  // this.executeSelect = (schemaName, tableName, predicate) => {
  //   // spit out all records only from pages currently in the buffer pool
  //   let records = [];

  //   this.pages[schemaName][tableName].forEach(page => {
  //     const resultset = page.select(predicate);
  //     records.push(...resultset);
  //   });

  //   return records;
  // }

  /**
   * @todo create executeSystemUpdate
   */

}

export default BufferPool;