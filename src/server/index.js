#! /usr/bin/env node

import { program } from 'commander';
import prompts from 'prompts';
import Page from '../bufferPool/page';

const tableDefinition = {
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
      maxLength: 50,
      order: 2
    },
    {
      name: 'Position',
      dataType: 6,
      isVariable: true,
      isNullable: true,
      maxLength: 30,
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

const data = new Page(tableDefinition);

program.command('start')
       .description('Starts the DB server')
       .action(start);

program.parse();

async function start() {
  console.log('Starting DB Server...');
  
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'query',
      message: '> '
    });

    if (response.query == '.exit') {
      console.log('Shutting down');
      break;
    }

    const parsedQuery = response.query.split(' ');

    switch (parsedQuery[0]) {
      case 'select':
        const records = data.selectAll();
        records.forEach(record => {
          console.log(record);
        });
        break;
      case 'insert':
        data.newRecord(parsedQuery[1], parsedQuery[2], parsedQuery[3], parsedQuery[4]);
        break;
      default:
        throw new Error('Unhandled query: ' + parsedQuery[0]);
    }
  }
}