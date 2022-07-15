export const PAGE_SIZE = 8192;
export const DATA_FILE_NAME = 'data.dndb';
export const LOG_FILE_NAME = 'data.lndb';
export const EMPTY_SPACE_CHAR = '_';

/**
 * @typedef ColumnType
 * @property {String} name
 * @property {Number} type
 * @property {Number} dataType
 * @property {Boolean} isIdentity
 * @property {Boolean} isNullable
 * @property {Boolean} isVariable
 * @property {Number} maxLength - the maximum number of characters allowed. (-1) for unbounded
 * @property {Number} precision
 * @property {Number} scale
 * @property {Number} order - the order of the column in the DDL definition, NOT the order on the page
 * @property {String} [colValue]
 */

/**
 * @constant
 * @type {Array<ColumnType>}
 */
export const OBJECTS_COLUMN_DEFINITIONS = [
  {
    name: 'object_id',
    type: 1,
    dataType: 2,
    isIdentity: true,
    isNullable: false,
    isVariable: false,
    maxLength: null,
    precision: null,
    scale: null,
    order: 1
  },
  {
    name: 'object_type',
    type: 1,
    dataType: 1,
    isIdentity: false,
    isNullable: false,
    isVariable: false,
    maxLength: null,
    precision: null,
    scale: null,
    order: 2
  },
  {
    name: 'is_system_object',
    type: 1,
    dataType: 4,
    isIdentity: false,
    isNullable: false,
    isVariable: false,
    maxLength: null,
    precision: null,
    scale: null,
    order: 3
  },
  {
    name: 'name',
    type: 1,
    dataType: 6,
    isIdentity: false,
    isNullable: true,
    isVariable: true,
    maxLength: 128,
    precision: null,
    scale: null,
    order: 4
  },
  {
    name: 'root_page_id',
    type: 1,
    dataType: 2,
    isIdentity: false,
    isNullable: false,
    isVariable: false,
    maxLength: null,
    precision: null,
    scale: null,
    order: 5
  },
  {
    name: 'parent_object_id',
    type: 1,
    dataType: 2,
    isIdentity: false,
    isNullable: true,
    isVariable: false,
    maxLength: null,
    precision: null,
    scale: null,
    order: 6
  },
  {
    name: 'ddl_text',
    type: 1,
    dataType: 6,
    isIdentity: false,
    isNullable: true,
    isVariable: true,
    maxLength: -1,
    precision: null,
    scale: null,
    order: 7
  }
];

export const DEFAULT_PAGE_HEADER_CONFIG = {
  fileId: 1,
  pageType: 1,
  pageLevel: 0,
  prevPageId: 0,
  nextPageId: 0
};