
/**
 * @typedef ColumnValue
 * @property {String} name
 * @property {(String|Number|Boolean)} value
 */

/**
 * @typedef Record
 * @property {Array<ColumnValue>}
 */

/**
 * @typedef SimplePredicate
 * @property {String} colName
 * @property {(String|Number|Boolean)} colValue
 */

/**
 * @typedef ResultCell
 * @property {String} name
 * @property {(String|Number|Boolean)} value
 * @property {Number} order
 */

/**
 * @typedef ColumnDefinition
 * @property {String} name,
 * @property {Number} dataType
 * @property {Boolean} isVariable
 * @property {Boolean} isNullable
 * @property {Number} [maxLength]
 * @property {Number} order
 */