import { flushPageToDisk, readPageFromDisk } from '../storageEngine';
import { getHeaderValue } from './deserializer';
import Page from './page';
import { generateBlankPage } from './serializer';

function BufferPool() {

  this.pages = [];

  this.loadPageIntoMemory = async (pageId, tableDefinition) => {
    const pageData = await readPageFromDisk(1, pageId);
    const page = new Page(tableDefinition);

    if (pageData) {
      page.initPageFromDisk(pageData);
    } else {
      const blankPage = generateBlankPage(1, pageId, 1);
      page.initPageFromDisk(blankPage);
    }
  }

  this.flushPageToDisk = async (pageId) => {
    const page = this.pages.find(pg => getHeaderValue('pageId', pg.header) == pageId);
    const isWritten = await flushPageToDisk(1, pageId, page.data);

    if (!isWritten) {
      console.log('Error writing pageId: ' + pageId);
    }
  }

  this.flushAll = async () => {
    this.pages.forEach(pg => {
      const pageId = getHeaderValue('pageId', pg.header);
      const isWritten = await flushPageToDisk(1, pageId, pg.data);

      if (!isWritten) {
        console.log('Error writing pageId: ' + pageId);
      }
    });
  }
}

export default BufferPool;