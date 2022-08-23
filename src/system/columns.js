import { BufferPool } from '../bufferPool';
import { generateBlankPage } from '../bufferPool/serializer';
import { writePageToDisk } from '../storageEngine';
import { getTableObjectByName } from './objects';
import { getNextSequenceValue, sequencesTableDefinition } from './sequences';
import sqliteParser from 'sqlite-parser';

export const columnsTableDefinition = [
  {
    name: 'column_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: true,
    maxLength: null,
    order: 1
  },
  {
    name: 'parent_object_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 2
  },
  {
    name: 'data_type',
    dataType: 1,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 3
  },
  {
    name: 'is_variable',
    dataType: 4,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 4
  },
  {
    name: 'is_nullable',
    dataType: 4,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 5
  },
  {
    name: 'is_primary_key',
    dataType: 4,
    isVariable: false,
    isNullable: true,
    isPrimaryKey: false,
    maxLength: null,
    order: 6
  },
  {
    name: 'max_length',
    dataType: 2,
    isVariable: false,
    isNullable: true,
    isPrimaryKey: false,
    maxLength: null,
    order: 7
  },
  {
    name: 'column_name',
    dataType: 6,
    isVariable: true,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: 128,
    order: 8
  },
  {
    name: 'column_order',
    dataType: 1,
    isVariable: false,
    isNullable: false,
    isPrimaryKey: false,
    maxLength: null,
    order: 9
  }
];

/**
 * @function
 * @param {BufferPool} buffer 
 */
export function initializeColumnsTable(buffer) {
  const blankPage = generateBlankPage(1, 3, 1);
  writePageToDisk('data', blankPage);
  buffer.loadPageIntoMemory('data', 3);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 export function initColumnsTableDefinition(buffer, startingColumnId) {
  let columnId = startingColumnId;
  columnsTableDefinition.forEach((def) => {
    const values = _getNewColumnInsertValues(columnId, 4, def.dataType, def.isVariable, def.isNullable, def.isPrimaryKey, def.maxLength, def.name, def.order);

    buffer.executeSystemColumnInsert(values);
    columnId++;
  });
}

/**
 * @function
 * @param {Number} columnId
 * @param {Number} parentObjectId 
 * @param {Number} dataType 
 * @param {Boolean} isVariable 
 * @param {Boolean} isNullable 
 * @param {Number} maxLength 
 * @param {String} columnName 
 * @param {Number} columnOrder 
 * @returns
 */
 export function _getNewColumnInsertValues(columnId, parentObjectId, dataType, isVariable, isNullable, isPrimaryKey, maxLength, columnName, columnOrder) {
  return [
    {
      name: 'column_id',
      value: columnId
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
      name: 'is_primary_key',
      value: isPrimaryKey
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

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {String} schemaName 
 * @param {String} tableName
 * @returns {Array<ColumnDefinition>}
 */
export function getColumnDefinitionsByName(buffer, schemaName, tableName) {
  const tableObject = getTableObjectByName(buffer, schemaName, tableName);
  const tableObjectId = tableObject.find(col => col.name.toLowerCase() === 'object_id');

  return getColumnDefinitionsByTableObjectId(buffer, tableObjectId);
}

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {Number} objectId 
 * @returns {Array<ColumnDefinition>}
 */
export function getColumnDefinitionsByTableObjectId(buffer, tableObjectId) {
  const query = `
    Select  *
    From sys.columns
    Where parent_object_id = ${tableObjectId}
  `;

  const tree = sqliteParser(query);

  const predicate = tree.statement[0].where;

  const resultSet = buffer.pageScan(3, predicate, columnsTableDefinition, []);

  const columnDefinitions = [];

  resultSet.forEach(row => {
    columnDefinitions.push(parseColumnDefinition(buffer, row));
  });

  return columnDefinitions;
}

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {Array<ResultCell>} resultColumns 
 * @returns {ColumnDefinition}
 */
function parseColumnDefinition(buffer, resultColumns) {
  const def = {
    autoIncrement: false
  };

  // /**
  //  * @todo refactor this functionality to use a joined query
  //  */

  const objectId = resultColumns.find(col => col.name == 'parent_object_id').value;
  const columnId = resultColumns.find(col => col.name == 'column_id').value;

  const query = `
    Select  *
    From sys.sequences
    Where object_id = ${objectId}
      And column_id = ${columnId}
  `;
  const tree = sqliteParser(query);
  const predicate = tree.statement[0].where;

  const sequences = buffer.pageScan(2, predicate, sequencesTableDefinition, []);

  if (sequences.length > 1) throw new Error('Too many sequences for object_id/column_id pair');

  if (sequences.length == 1) {
    def.autoIncrement = true;
  }

  resultColumns.forEach(col => {
    switch (col.name) {
      case 'column_id':
        def.columnId = Number(col.value);
        break;
      case 'data_type':
        def.dataType = Number(col.value);
        break;
      case 'is_variable':
        def.isVariable = !!col.value;
        break;
      case 'is_nullable':
        def.isNullable = !!col.value;
        break;
      case 'is_primary_key':
        def.isPrimaryKey = !!col.value;
        break;
      case 'max_length':
        def.maxLength = isNaN(Number(col.value)) ? col.value : Number(col.value);
        break;
      case 'column_name':
        def.name = col.value;
        break;
      case 'column_order':
        def.order = Number(col.value);
        break;
    }
  });

  return def;
}