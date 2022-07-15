import { BufferPool } from '../bufferPool';
import { StorageEngine } from '../storageEngine';
import express from 'express';
import path from 'path';
import { DATA_FILE_NAME } from '../constants';
import { initNewDb } from './init';

const port = 6969;
const app = express();

var storage = new StorageEngine();
var memory = new BufferPool();

await startup();

console.log(memory.pageCount);
console.log(memory.pages);


async function startup() {
  console.log('Starting DB Server...');

  try {
    const filename = path.resolve(__dirname, '../rdbms/data/' + DATA_FILE_NAME);
    console.log(filename);
    const fileExists = await storage.diskReader.databaseFileExists(filename);

    if (fileExists) {
      // load the first page of the DB file
      const pageData = await storage.diskReader.readPageFromDisk(filename, 1);
        
      memory.loadPage(pageData, 'objects', true);
    } else {
      await initNewDb(storage, memory);
    }
  } catch (error) {
    console.log(error);
  }
}