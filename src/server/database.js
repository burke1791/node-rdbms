import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import DbHeader from '../structs/dbHeader';

/**
 * Orchestrates all of the tasks necessary to initialize a new database
 * @function newDatabase
 */
export async function newDatabase(fullFilePath) {
  // write a new file to the data directory using the `blankDbFile.dndb` template
  const success = await newDatabaseFile(fullFilePath);


}

async function newDatabaseFile(fullFilePath) {
  const templatePath = path.resolve(__dirname, '../rdbms/init/blankDbFile.dndb');
  const templateFileData = await readFile(templatePath, { encoding: 'utf-8' });

  const success = await writeFile(fullFilePath, templateFileData, { encoding: 'utf-8' });

  return success;
}

async function newPage(isFirstPageInFile) {

}

function createSystemObjects() {

}

