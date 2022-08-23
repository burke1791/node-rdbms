import BufferPool from '../bufferPool';
import { generateBlankPage } from '../bufferPool/serializer';
import { writePageToDisk } from '../storageEngine';
import { getNewColumnInsertValues, _getNewColumnInsertValues } from './columns';
import sqliteParser from 'sqlite-parser';
import { executeUpdate } from '../queryProcessor/update';

export const sequencesTableDefinition = [
  {
    name: 'sequence_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: true,
    maxLength: null,
    order: 1
  },
  {
    name: 'object_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 2
  },
  {
    name: 'column_id',
    dataType: 2,
    isVariable: false,
    isNullable: true,
    isPrimaryKey: false,
    maxLength: null,
    order: 3
  },
  {
    name: 'next_sequence_value',
    dataType: 3,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 4
  },
  {
    name: 'sequence_increment',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 5
  }
];

/**
 * @function
 * @param {BufferPool} buffer
 */
export function initializeSequencesTable(buffer) {
  const blankPage = generateBlankPage(1, 2, 1);
  writePageToDisk('data', blankPage);
  buffer.loadPageIntoMemory('data', 2);

  // add the hard-coded sequence records
  initPagesSequence(buffer);
  initObjectsSequence(buffer);
  initSequencesSequence(buffer);
  initColumnsSequence(buffer);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
function initPagesSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(1, 1, null, 4, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
function initObjectsSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(2, 2, 1, 5, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initSequencesSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(3, 3, 8, 5, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initColumnsSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(4, 4, 13, 22, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
export function initSequencesTableDefinition(buffer, startingColumnId) {
  let columnId = startingColumnId;
  sequencesTableDefinition.forEach((def) => {
    const values = _getNewColumnInsertValues(columnId, 3, def.dataType, def.isVariable, def.isNullable, def.isPrimaryKey, def.maxLength, def.name, def.order);

    buffer.executeSystemColumnInsert(values);
    columnId++;
  });
}

export function getNewSequenceInsertValues(sequenceId, objectId, columnId, nextSequenceValue, sequenceIncrement) {
  return [
    {
      name: 'sequence_id',
      value: sequenceId
    },
    {
      name: 'object_id',
      value: objectId
    },
    {
      name: 'column_id',
      value: columnId
    },
    {
      name: 'next_sequence_value',
      value: nextSequenceValue
    },
    {
      name: 'sequence_increment',
      value: sequenceIncrement
    }
  ];
}

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {Number} objectId
 * @param {Number} [columnId]
 * @returns {Number}
 */
export function getNextSequenceValue(buffer, objectId, columnId) {
  let query = `
    Select  *
    From sys.sequences
    Where object_id = ${objectId}
  `;

  if (columnId) {
    query = query + 'And column_id = ' + columnId;
  }

  const tree = sqliteParser(query);
  const predicate = tree.statement[0].where;

  const resultset = buffer.pageScan(2, predicate, sequencesTableDefinition, []);

  if (resultset.length > 1) {
    console.log(resultset);
    console.log(predicate);
    throw new Error('getNextSequenceValue: returned more than one result for schema: ' + predicate);
  }

  const sequenceId = Number(resultset[0].find(col => col.name.toLowerCase() === 'sequence_id').value);
  const nextSequenceValue = Number(resultset[0].find(col => col.name.toLowerCase() === 'next_sequence_value').value);
  const seqIncrement = Number(resultset[0].find(col => col.name.toLowerCase() === 'sequence_increment').value);

  query = `
    Update sys.sequences
    Set next_sequence_value = next_sequence_value + sequence_increment
    Where sequence_id = ${sequenceId}
  `;

  const updTree = sqliteParser(query);

  const rowCount = executeUpdate(buffer, updTree.statement[0], 'SYSTEM');

  return nextSequenceValue;
}