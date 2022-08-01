import { writePageToDisk, readPageFromDisk } from '../storageEngine';
import { getHeaderValue } from './deserializer';
import Page from './page';
import { generateBlankPage, serializeRecord, validateInsertValues } from './serializer';

/**
 * @class
 * @param {Number} maxPageCount 
 */
function BufferPool(maxPageCount) {

  this.pages = {};
  this.pageCount = 0;
  this.maxPageCount = maxPageCount;

  this.loadPageIntoMemory = async (pageId, tableDefinition) => {
    const pageData = await readPageFromDisk(1, pageId);
    const page = new Page(tableDefinition);

    if (pageData) {
      page.initPageFromDisk(pageData);
    } else {
      const blankPage = generateBlankPage(1, pageId, 1);
      page.initPageFromDisk(blankPage);
    }

    if (this.pages[tableDefinition] == undefined) this.pages[tableDefinition.name] = [];
    this.pages[tableDefinition.name].push(page);
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
      const page = this.pages[tableName].find(pg => pg.hasAvailableSpace(record));

      if (page == undefined) throw new Error('Need to create a new page');

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