import BufferPool from '../../bufferPool';
import { fileExists } from '../../storageEngine/reader';

/**
 * Performs startup tasks for the DB server
 * @function
 * @param {BufferPool} buffer
 * @returns {Boolean}
 */
export async function startup(buffer) {
  console.log('Starting DB Server...');

  try {
    const dataFileExists = await fileExists('data');

    if (!dataFileExists) {
      // initialize the DB
      console.log('First startup, initializing DB...');
      await initializeObjectsTable(buffer);
      await initializeSequencesTable(buffer);
      await initializeColumnsTable(buffer);
      
      initObjectsTableDefinition(buffer, 1);
      initSequencesTableDefinition(buffer, 8);
      initColumnsTableDefinition(buffer, 12);

      await buffer.flushAll();
    }

    // load the first DB page into memory
    await buffer.loadPageIntoMemory('data', 1);
    
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}