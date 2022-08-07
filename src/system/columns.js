import BufferPool from '../bufferPool';
import { generateBlankPage } from '../bufferPool/serializer';
import { writePageToDisk } from '../storageEngine';
import { getNextSequenceValue } from './sequences';

export const columnsTableDefinition = [
  {
    name: 'column_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 1
  },
  {
    name: 'parent_object_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 2
  },
  {
    name: 'data_type',
    dataType: 1,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 3
  },
  {
    name: 'is_variable',
    dataType: 4,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 4
  },
  {
    name: 'is_nullable',
    dataType: 4,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 5
  },
  {
    name: 'max_length',
    dataType: 2,
    isVariable: false,
    isNullable: true,
    maxLength: null,
    order: 6
  },
  {
    name: 'column_name',
    dataType: 6,
    isVariable: true,
    isNullable: false,
    maxLength: 128,
    order: 7
  },
  {
    name: 'column_order',
    dataType: 1,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 8
  }
];

/**
 * @function
 * @param {BufferPool} buffer 
 */
export async function initializeColumnsTable(buffer) {
  const blankPage = generateBlankPage(1, 3, 1);
  await writePageToDisk('data', blankPage);
  await buffer.loadPageIntoMemory('data', 3);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 export function initColumnsTableDefinition(buffer) {
  columnsTableDefinition.forEach(def => {
    const values = getNewColumnInsertValues(buffer, 4, def.dataType, def.isVariable, def.isNullable, def.maxLength, def.name, def.order);

    buffer.executeSystemColumnInsert(values);
  });
}

/**
 * @function
 * @param {BufferPool} buffer
 * @param {Number} parentObjectId 
 * @param {Number} dataType 
 * @param {Boolean} isVariable 
 * @param {Boolean} isNullable 
 * @param {Number} maxLength 
 * @param {String} columnName 
 * @param {Number} columnOrder 
 * @returns
 */
export function getNewColumnInsertValues(buffer, parentObjectId, dataType, isVariable, isNullable, maxLength, columnName, columnOrder) {
  const nextSequenceValue = getNextSequenceValue(buffer, 4);

  return [
    {
      name: 'column_id',
      value: nextSequenceValue
    },
    {
      name: 'parent_object_id',
      value: parentObjectId
    },
    {
      name: 'data_type',
      value: dataType
    },
    {
      name: 'is_variable',
      value: isVariable
    },
    {
      name: 'is_nullable',
      value: isNullable
    },
    {
      name: 'max_length',
      value: maxLength
    },
    {
      name: 'column_name',
      value: columnName
    },
    {
      name: 'column_order',
      value: columnOrder
    }
  ];
}