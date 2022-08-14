import { writePageToDisk, readPageFromDisk } from '../storageEngine';
import { columnsTableDefinition, getColumnDefinitionsByTableObjectId } from '../system/columns';
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
    const isWritten = await writePageToDisk('data', page.data);

    if (!isWritten) {
      console.log('Error writing pageId: ' + pageId);
    }
  }

  this.flushAll = async () => {
    const pageIds = Object.keys(this.pages);

    for (let pageId of pageIds) {
      const page = this.pages[pageId];
      const isWritten = await writePageToDisk('data', page.data);

      if (!isWritten) {
        console.log('Error writing pageId: ' + pageId);
      }
    }
  }

  /**
   * @method
   * @param {Number} pageId 
   * @param {Array<SimplePredicate>} predicate
   * @param {Array<ColumnDefinition>} columnDefinitions
   * @param {Array<Array<ResultCell>>} [results]
   * @returns {{Array<Array<ResultCell>>}}
   */
  this.scan = async (pageId, predicate, columnDefinitions, results = []) => {
    if (this.pages[pageId] == undefined) {
      await this.loadPageIntoMemory('data', pageId);
    }

    const page = this.pages[pageId];

    if (getHeaderValue('pageType', page.header) == '2') {
      throw new Error('Index pages are not supported yet!');
    } else {
      results.push(...page.select(predicate, columnDefinitions));
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

    const objectRecord = await getTableObjectByName(this, schemaName, tableName);
    const rootPageId = objectRecord.find(col => col.name.toLowerCase() === 'root_page_id').value;
    const tableObjectId = objectRecord.find(col => col.name.toLowerCase() === 'object_id').value;

    const columnDefinitions = await getColumnDefinitionsByTableObjectId(this, tableObjectId);
    
    const results = await this.scan(rootPageId, predicate, columnDefinitions, results);

    return results;
  }

  /**
   * @function
   * @param {Query} query 
   * @returns {Array<Array<ResultCell>>}
   */
  this.executeQuery = async (query) => {
    const { schemaName, tableName } = query.from;
    const predicate = query.where;

    let results;

    switch (query.type) {
      case 'select':
        results = await this.executeSelect(schemaName, tableName, predicate);
        break;
      default:
        throw new Error('We only support SELECT queries at the moment');
        break;
    }

    // prune columns not defined in the query object
    if (query.columns[0] != '*') {
      const prunedResults = results.map(row => {
        const columns = row.filter(col => {
          const matchedCol = query.columns.find(name => name === col.name.toLowerCase());

          if (matchedCol == undefined) return false;
          return true;
        });

        return columns;
      });

      return prunedResults;
    }

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

}

export default BufferPool;