#! /usr/bin/env node

import { program } from 'commander';
import prompts from 'prompts';
import BufferPool from '../bufferPool';
import { fileExists } from '../storageEngine/reader';
import { initColumnsTableDefinition, initializeColumnsTable } from '../system/columns';
import { initializeObjectsTable, initObjectsTableDefinition } from '../system/objects';
import { initializeSequencesTable, initSequencesTableDefinition } from '../system/sequences';
import { pad } from '../utilities/helper';
import { parser } from './parser';

const buffer = new BufferPool(5)

program.command('start')
       .description('Starts the DB server')
       .action(start);

program.parse();

async function start() {
  console.log('Starting DB Server...');

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

  // loading the first DB page into memory at startup
  await buffer.loadPageIntoMemory('data', 1);
  
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'query',
      message: '> '
    });

    if (response.query == '.exit') {
      buffer.flushAll();
      console.log('Shutting down');
      break;
    }

    const parsedQuery = response.query.split(' ');

    switch (parsedQuery[0]) {
      case 'select':
        const tree = parser(response.query);
        console.log(tree);
        const records = await buffer.executeQuery(tree);
        displayRecords(records);
        break;
      default:
        throw new Error('Unhandled query: ' + parsedQuery[0]);
    }
  }
}

function transformSelectInput(query) {
  const parsedQuery = query.split(' ');
  
  const [schema, table] = parsedQuery[1].split('.');
  return { schema, table };
}

function displayRecords(resultset) {
  const resultMetadata = {};
  const firstRecord = resultset[0];
  const numRecords = resultset.length;
  const numRecordsDigitCount = numDigits(numRecords);

  firstRecord.forEach(col => {
    resultMetadata[col.name] = {
      order: col.order,
      length: col.name.length
    };
  });

  resultset.forEach(row => {
    row.forEach(col => {
      const valueSize = String(col.value).length;

      if (resultMetadata[col.name].length < valueSize) {
        resultMetadata[col.name].length = valueSize;
      }
    });
  });

  let output = '';
  output += constructOutputCell('', numRecordsDigitCount, 'right', true);

  // construct the header output row
  firstRecord.forEach(col => {
    output += constructOutputCell(col.name, resultMetadata[col.name].length, 'left', true);
  });

  console.log(output);

  // Print a row of hyphens to separate the headers from the data
  const outputLength = output.length;

  output = '-'.repeat(outputLength);
  console.log(output);

  resultset.forEach((row, ind) => {
    let output = '';
    output += constructOutputCell(ind + 1, numRecordsDigitCount, 'right', true);
    row.forEach(col => {
      let alignment = 'left';

      if (typeof col.value == 'number') {
        alignment = 'right';
      }

      let colValue = col.value;

      if (col.value == null) {
        colValue = 'NULL';
      }

      output += constructOutputCell(colValue, resultMetadata[col.name].length, alignment, true);
    });

    console.log(output);
  });
}

function numDigits(num, count = 0) {
  if(num){
    return numDigits(Math.floor(num / 10), ++count);
  };

  return count;
};

/**
 * @function
 * @param {Any} value 
 * @param {Number} size 
 * @param {(left|right)} alignment 
 * @param {Boolean} padding 
 */
function constructOutputCell(value, size, alignment, padding) {
  let text = '';
  
  text = pad(value, size, alignment);

  if (padding) {
    text = ' ' + text + ' |';
  } else {
    text = text + '|';
  }

  return text;
}