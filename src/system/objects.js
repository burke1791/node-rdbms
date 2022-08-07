import BufferPool from '../bufferPool';
import { generateBlankPage } from '../bufferPool/serializer';
import { writePageToDisk } from '../storageEngine';
import { getNewColumnInsertValues } from './columns';

export const objectsTableDefinition = [
  {
    name: 'object_id',
    dataType: 2,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 1
  },
  {
    name: 'object_type_id',
    dataType: 1,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 2
  },
  {
    name: 'is_system_object',
    dataType: 4,
    isVariable: false,
    isNullable: false,
    maxLength: null,
    order: 3
  },
  {
    name: 'schema_name',
    dataType: 6,
    isVariable: true,
    isNullable: true,
    maxLength: 128,
    order: 4
  },
  {
    name: 'object_name',
    dataType: 6,
    isVariable: true,
    isNullable: false,
    maxLength: 128,
    order: 5
  },
  {
    name: 'root_page_id',
    dataType: 2,
    isVariable: false,
    isNullable: true,
    maxLength: null,
    order: 6
  },
  {
    name: 'parent_object_id',
    dataType: 2,
    isVariable: false,
    isNullable: true,
    maxLength: null,
    order: 7
  }
];

/**
 * @function
 * @param {BufferPool} buffer
 */
export async function initializeObjectsTable(buffer) {
  const blankPage = generateBlankPage(1, 1, 1);
  await writePageToDisk('data', blankPage);
  await buffer.loadPageIntoMemory('data', 1);

  // init hard-coded object records
  initPagesObject(buffer);
  initObjectsObject(buffer);
  initSequencesObject(buffer);
  initColumnsObject(buffer);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
function initPagesObject(buffer) {
  const insertValues = _getNewObjectInsertValues(1, 0, true, null, 'pages', null, null);

  buffer.executeSystemObjectInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initObjectsObject(buffer) {
  const insertValues = _getNewObjectInsertValues(2, 1, true, 'sys', 'objects', 1, null);

  buffer.executeSystemObjectInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initSequencesObject(buffer) {
  const insertValues = _getNewObjectInsertValues(3, 1, true, 'sys', 'sequences', 2, null);

  buffer.executeSystemObjectInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
 function initColumnsObject(buffer) {
  const insertValues = _getNewObjectInsertValues(4, 1, true, 'sys', 'columns', 3, null);

  buffer.executeSystemObjectInsert(insertValues);
}

/**
 * @function
 * @param {BufferPool} buffer 
 */
export function initObjectsTableDefinition(buffer) {
  objectsTableDefinition.forEach(def => {
    const values = getNewColumnInsertValues(buffer, 2, def.dataType, def.isVariable, def.isNullable, def.maxLength, def.name, def.order);

    buffer.executeSystemColumnInsert('columns', values);
  });
}

/**
 * @function
 * @param {Number} objectId 
 * @param {Number} objectTypeId 
 * @param {Boolean} isSystemObject 
 * @param {String} schemaName 
 * @param {String} objectName 
 * @param {Number} rootPageId 
 * @param {Number} parentObjectId 
 * @returns 
 */
function _getNewObjectInsertValues(objectId, objectTypeId, isSystemObject, schemaName, objectName, rootPageId, parentObjectId) {
  return [
    {
      name: 'object_id',
      value: objectId
    },
    {
      name: 'object_type_id',
      value: objectTypeId
    },
    {
      name: 'is_system_object',
      value: isSystemObject
    },
    {
      name: 'schema_name',
      value: schemaName
    },
    {
      name: 'object_name',
      value: objectName
    },
    {
      name: 'root_page_id',
      value: rootPageId
    },
    {
      name: 'parent_object_id',
      value: parentObjectId
    }
  ];
}

/**
 * @function
 * @param {BufferPool} buffer
 */
export function addObjectsTableRecordToSequencesTable(buffer) {
  const values = getSequencesInsertValues()
}

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {Number} objectId 
 * @returns {<Array<ResultCell>>}
 */
export async function getObjectById(buffer, objectId) {
  const predicate = [
    {
      colName: 'object_id',
      colValue: objectId
    }
  ];

  const resultset = await buffer.executeSelect('objects', predicate);

  return resultset[0] || undefined;
}

/**
 * @function
 * @param {BufferPool} buffer 
 * @param {String} schema_name
 * @param {String} table_name 
 * @returns {Array<ResultCell>}
 */
export async function getTableObjectByName(buffer, schema_name, table_name) {
  const predicate = [
    {
      colName: 'schema_name',
      colValue: schema_name
    },
    {
      colName: 'object_name',
      colValue: table_name
    },
    {
      colName: 'object_type_id',
      colValue: 1
    }
  ];

  const resultSet = await buffer.scan(1, predicate, []);

  if (resultSet.length > 1) {
    console.log(resultSet);
    throw new Error('getTableObjectByName: returned more than one result for schema: ' + schema_name + ' and object: ' + table_name);
  }

  return resultSet[0];
}