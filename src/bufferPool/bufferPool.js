import { DATA_FILE_NAME, PAGE_SIZE } from '../constants';
import { StorageEngine } from '../storageEngine';
import Page from '../structs/page';
import path from 'path';

const storage = new StorageEngine();
const filename = path.resolve(__dirname, '../rdbms/data/' + DATA_FILE_NAME);

/**
 * @typedef SqlCommand
 * @property {String} action
 */

/**
 * @typedef ColumnUpdateType
 * @property {Number} columnIndex
 * @property {String} newValue
 */

/**
 * @typedef QueryPredicate
 * @property {Number} columnIndex
 * @property {String} value
 */

/**
 * @typedef IOStats
 * @property {Number} logicalReads
 * @property {Number} logicalWrites
 * @property {Number} physicalReads
 * @property {Number} physicalWrites
 */

/**
 * @typedef QueryResult
 * @property {Array<any>} resultset
 * @property {Number} recordCount
 * @property {IOStats} perf
 */

/**
 * Creates a BufferPool instance
 * @class BufferPool
 * @param {Number} [maxMemoryInKb]
 */
function BufferPool(maxMemoryInKb = 256) {

  this.maxPageCount = Math.floor(maxMemoryInKb * 1024 / PAGE_SIZE);
  this.pageCount = 0;
  this.systemPages = {}; // does not count towards `maxPageCount`
  this.pages = {};

  /**
   * @function
   * @param {String} fileData 
   * @param {String} objectName 
   * @param {Boolean} isFirstPageInFile 
   */
  this.loadPage = (fileData, objectName, isFirstPageInFile) => {
    const name = objectName == undefined ? 'objects' : objectName;
    const page = new Page(fileData, name, isFirstPageInFile);

    if (this.systemPages[objectName] == undefined) this.systemPages[objectName] = [];

    this.systemPages[objectName].push(page);
  }

  /**
   * @method
   * @param {Array<SqlCommand>} commands 
   * @returns {QueryResult}
   */
  this.executeQuery = (commands) => {

  }

  /**
   * @method
   * @param {String} tableName 
   * @param {Array<any>} columnDefinitions 
   * @param {Boolean} isSystemTable 
   * @param {String} [ddl_text]
   * @returns {QueryResult}
   */
  function newNable(tableName, columnDefinitions, isSystemTable, ddl_text) {
    /*
      A new table requires a few steps:
        1. Get the next `object_id` value from the `sequences` table
        2. Increment the next `object_id` value in the `sequences` table
        3. Insert a record into the `objects` table
          a. If it's NOT a system table, insert a record for each column in the table
        4. IF the table has an identity column, insert a record into the sequences table for it
        5. Create a new DB page for the new table
    */

    // 1: Get the next `object_id` sequence value
    const result = {
      resultset: undefined,
      recordCount: 0,
      perf: {
        logicalReads: 0,
        logicalWrites: 0,
        physicalReads: 0,
        physicalWrites: 0
      }
    };
    const sequenceResult = nextSequenceValue(tableName);
    const nextValue = sequenceResult.resultset[0].next_sequence_value;

    mergeResultData(result, sequenceResult);

    // 2: Increment the `object_id` sequence
    if (tableName !== 'sequences') {
      const predicate = {
        columnIndex: 0,
        value: 'objects'
      };
  
      const updateArr = [
        {
          columnIndex: 1,
          value: nextValue + 1
        }
      ];
  
      const updateResult = update('sequences', true, predicate, updateArr);
      mergeResultData(result, updateResult);
    }

    // 3: Insert a record into the `objects` table
    const insertResult = insert(tableName)
  }

  function insert(tableName, )

  /**
   * @method
   * @param {String} tableName 
   * @returns {QueryResult}
   */
  async function nextSequenceValue(tableName) {
    const result = {
      resultset: [{ next_sequence_value: 1 }],
      recordCount: 1,
      perf: {
        logicalReads: 0,
        logicalWrites: 0,
        physicalReads: 0,
        physicalWrites: 0
      }
    };

    if (tableName === 'sequences') return result;

    // check if `sequences` is in memory
    const sequencesPageCount = this.systemPages?.sequences.length;

    if (sequencesPageCount == undefined) {
      // read the sequences page from disk
      let sequenceFound = false;
      let pageId = 2 // sequences root page is always on pageId=2
      while (!sequenceFound) {
        const pageData = await storage.diskReader.readPageFromDisk(filename, pageId);
        result.perf.physicalReads++;
        this.loadPage(pageData, 'sequences');
        
        /**
         * @todo complete this algorithm
         * Need to read the value from the buffer pool
         * If the page we loaded is a B-tree page, determine the pageId of the next page to read, etc
         */

        throw new Error('Algorithm is not complete');
      }
    }

    return result;
  }

  /**
   * @method
   * @param {String} tableName 
   * @param {Boolean} isSystemTable
   * @param {Array<QueryPredicate>} predicate
   * @param {Array<ColumnUpdateType>} columnUpdateArr 
   * @returns {QueryResult}
   */
  function update(tableName, isSystemTable, predicate, columnUpdateArr) {
    /**
     * @todo if the page is not in the buffer pool, read it from disk
     */

    const result = {
      resultset: undefined,
      recordCount: 0,
      perf: {
        logicalReads: 0,
        logicalWrites: 0,
        physicalReads: 0,
        physicalWrites: 0
      }
    };

    let updateComplete = false;
    
    if (isSystemTable) {
      for (let page of this.systemPages[tableName]) {
        result.perf.logicalReads++;
        const updateCount = page.changeRecord(predicate, columnUpdateArr);
        if (updateCount > 0) result.perf.logicalWrites++;
        result.recordCount += updateCount;
      }
    } else {
      for (let page of this.pages[tableName]) {
        result.perf.logicalReads++;
        const updateCount = page.changeRecord(predicate, columnUpdateArr);
        if (updateCount > 0) result.perf.logicalWrites++;
        result.recordCount += updateCount;
      }
    }
    
    return result;
  }

  /**
   * @method
   * @param {QueryResult} current 
   * @param {QueryResult} next
   */
  function mergeResultData(current, next) {
    current.recordCount += next.recordCount;
    current.perf.logicalReads = next.perf.logicalReads;
    current.perf.logicalWrites = next.perf.logicalWrites;
    current.perf.physicalReads = next.perf.physicalReads;
    current.perf.physicalWrites = next.perf.physicalWrites;
  }
}

export default BufferPool;