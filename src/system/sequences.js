import BufferPool from '../bufferPool';
import { generateBlankPage } from '../bufferPool/serializer';
import { writePageToDisk } from '../storageEngine';

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
  const insertValues = getNewSequenceInsertValues(1, 1, 4, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
function initObjectsSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(2, 2, 4, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initSequencesSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(3, 3, 4, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initColumnsSequence(buffer) {
  const insertValues = getNewSequenceInsertValues(4, 4, 1, 1);

  buffer.executeSystemSequenceInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
export function initSequencesTableDefinition(buffer) {
  sequencesTableDefinition.forEach(def => {
    const values = getNewColumnInsertValues(buffer, 3, def.dataType, def.isVariable, def.isNullable, def.maxLength, def.name, def.order);

    buffer.executeSystemColumnInsert(values);
  });
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
 * @param {BufferPool} buffer 
 * @param {Number} objectId
 * @returns {Number}
 */
export function getNextSequenceValue(buffer, objectId) {
  const predicate = [
    {
      colName: 'object_id',
      colValue: objectId
    }
  ];

  const resultset = buffer.executeSelect('sys', 'sequences', predicate);
  const nextSequenceValue = Number(resultset[0].find(col => col.name.toLowerCase() === 'next_sequence_value').value);
  const seqIncrement = Number(resultset[0].find(col => col.name.toLowerCase() === 'sequence_increment').value);

  /**
   * @todo update the next_sequence_value
   */

  return nextSequenceValue;
}