import { DEFAULT_PAGE_HEADER_CONFIG } from "../constants";

export async function initNewDb(storage, memory) {
  // create the first data file
  const defaultPageHeaderConfig = DEFAULT_PAGE_HEADER_CONFIG;

  defaultPageHeaderConfig.pageId = 1;

  const success = await storage.diskWriter.newFile(filename, defaultPageHeaderConfig);

  if (success) {
    // load the new page into memory
    const pageData = await storage.diskReader.readPageFromDisk(filename, 1);
    memory.loadPage(pageData, 'objects', true);
  } else {
    throw new Error('Unable to create a new DB file');
  }

  await createSystemObjects();
}

async function createSystemObjects(storage, memory) {

}

async function createSequencesTable(storage, memory) {
  
}