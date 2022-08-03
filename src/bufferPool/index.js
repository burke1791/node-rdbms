import { writePageToDisk, readPageFromDisk } from '../storageEngine';
import { isDuplicateKey } from './constraints';
import { getHeaderValue } from './deserializer';
import Page from './page';
import { generateBlankPage, serializeRecord, validateInsertValues } from './serializer';

/**
 * @class
 * @param {Number} maxPageCount
 * @param {Array<Object>} tableDefinition
 */
function BufferPool(maxPageCount, tableDefinition) {

  this.tableDefinition = tableDefinition;
  this.pages = {};
  this.pageCount = 0;
  this.maxPageCount = maxPageCount;

  this.loadPageIntoMemory = async (pageId) => {
    const pageData = await readPageFromDisk(1, pageId);
    const page = new Page(this.tableDefinition);

    if (pageData) {
      page.initPageFromDisk(pageData);
    } else {
      const blankPage = generateBlankPage(1, pageId, 1);
      page.initPageFromDisk(blankPage);
    }

    if (this.pages[this.tableDefinition] == undefined) this.pages[this.tableDefinition.name] = [];
    this.pages[this.tableDefinition.name].push(page);
    this.pageCount++;
  }

  this.flushPageToDisk = async (pageId) => {
    const page = this.pages.find(pg => getHeaderValue('pageId', pg.header) == pageId);
    const isWritten = writePageToDisk(1, pageId, page.data);

    if (!isWritten) {
      console.log('Error writing pageId: ' + pageId);
    }
  }

  this.flushAll = async () => {
    const tableNames = Object.keys(this.pages);

    for (let table of tableNames) {
      this.pages[table].forEach(pg => {
        const pageId = getHeaderValue('pageId', pg.header);
        const isWritten = writePageToDisk(1, pageId, pg.data);
  
        if (!isWritten) {
          console.log('Error writing pageId: ' + pageId);
        }
      });
    }
  }

  this.executeInsert = (tableName, records) => {
    records.forEach(record => {
      const pk = Number(record.find(col => col.name.toLowerCase() === 'employeeid').value);

      for (let page of this.pages[tableName]) {
        if (isDuplicateKey(page, pk)) {
          console.log('Duplicate key');
          return false;
        }
      }

      let page = this.pages[tableName].find(pg => pg.hasAvailableSpace(record));

      if (page == undefined) {
        // create a new page
        page = new Page(this.tableDefinition);
        const blankPage = generateBlankPage(1, this.pageCount + 1, 1);
        page.initPageFromDisk(blankPage);
        this.pages[tableName].push(page);
        this.pageCount++;
      }

      page.newRecord(record);
    });
  }

  this.executeSelect = (tableName) => {
    // spit out all records only from pages currently in the buffer pool
    let records = [];

    this.pages[tableName].forEach(page => {
      const resultset = page.selectAll();
      records.push(...resultset);
    });

    return records;
  }
}

export default BufferPool;