#! /usr/bin/env node

import { program } from 'commander';
import prompts from 'prompts';
import BufferPool from '../bufferPool';
import { pad } from '../utilities/helper';

const employeeTable = {
  name: 'Employee',
  columns: [
    {
      name: 'EmployeeId',
      dataType: 2,
      isVariable: false,
      isNullable: false,
      maxLength: null,
      order: 1
    },
    {
      name: 'Name',
      dataType: 6,
      isVariable: true,
      isNullable: false,
      maxLength: 30,
      order: 2
    },
    {
      name: 'Position',
      dataType: 5,
      isVariable: false,
      isNullable: true,
      maxLength: 100,
      order: 3
    },
    {
      name: 'Salary',
      dataType: 3,
      isVariable: false,
      isNullable: false,
      maxLength: null,
      order: 4
    }
  ]
};

const testTable = {
  name: 'Test',
  columns: [
    {
      name: 'Name',
      dataType: 5,
      isVariable: false,
      isNullable: false,
      maxLength: 5000,
      order: 1
    }
  ]
}

const tableDefinition = employeeTable

const buffer = new BufferPool(5, tableDefinition)

program.command('start')
       .description('Starts the DB server')
       .action(start);

program.parse();

async function start() {
  console.log('Starting DB Server...');

  // loading the first DB page into memory at startup
  await buffer.loadPageIntoMemory(1);
  
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
        const records = buffer.executeSelect(tableDefinition.name);
        // console.log(records);
        displayRecords(records);
        break;
      case 'insert':
        const values = transformInsertInput(response.query);
        buffer.executeInsert(tableDefinition.name, values);
        break;
      default:
        throw new Error('Unhandled query: ' + parsedQuery[0]);
    }
  }
}

function transformInsertInput(query) {
  const parsedQuery = query.split(' ');
  const values = [];

  for (let i = 1; i < parsedQuery.length; i++) {
    const name = tableDefinition.columns[i - 1].name;
    let value = parsedQuery[i];
    if (value.trim().toLowerCase() == 'null') value = null;

    values.push({ name: name, value: value });
  }

  return [values];
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

      output += constructOutputCell(col.value, resultMetadata[col.name].length, alignment, true);
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