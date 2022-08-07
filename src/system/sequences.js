import BufferPool from '../bufferPool';
import { generateBlankPage } from '../bufferPool/serializer';
import { writePageToDisk } from '../storageEngine';
import { getObject } from './objects';

export const sequencesTableDefinition = [
  {
    name: 'sequence_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 1
  },
  {
    name: 'object_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 2
  },
  {
    name: 'next_sequence_value',
    dataType: 3,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 3
  },
  {
    name: 'sequence_increment',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 4
  }
];

/**
 * @function
 * @param {BufferPool} buffer
 */
export async function initializeSequencesTable(buffer) {
  const blankPage = generateBlankPage(1, 2, 1);
  await writePageToDisk('data', blankPage);
  await buffer.loadPageIntoMemory('data', 2);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
function initObjectsSequence(buffer) {
  const insertValues = getNewSequenceInsertValues();
}

function getNewSequenceInsertValues(sequenceId, objectId, nextSequenceValue, sequenceIncrement) {
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
 * @param {Number} objectId 
 * @param {Number} seqBegin 
 * @param {Number} seqIncrement 
 * @returns {Array<ColumnValue>}
 */
export function newSequenceRecord(objectId, seqBegin, seqIncrement) {
  /**
   * @todo validate inputs
   */

  return [
    {
      name: 'sequence_id',
      value: nextSequenceValue
    }
  ]
}

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {Number} objectId 
 */
export function getNextSequenceValue(buffer, objectId) {
  const objectName = object.find(col => col.name.toLowerCase() == 'object_name').value;
  const schemaName
}