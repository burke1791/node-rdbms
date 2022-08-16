
/**
 * @typedef SqlResultNode
 * @property {('identifier'|'literal')} type
 * @property {('star'|'column'|'decimal'|'text'|'null')} variant
 * @property {String} [name]
 * @property {String} [value]
 */

/**
 * @typedef SqlFromNode
 * @property {('identifier')} type
 * @property {('table')} variant
 * @property {String} schemaName
 * @property {String} tableName
 * @property {String} [alias]
 */

/**
 * @typedef SqlWhereComparisonNode
 * @property {('identifier'|'literal')} type
 * @property {('column'|'decimal'|'text'|'null')} variant
 * @property {String} [name]
 * @property {String} [value]
 */

/**
 * @typedef SqlWhereNode
 * @property {('expression')} type
 * @property {('binary')} format
 * @property {('operation')} variant
 * @property {('='|'>'|'<'|'>='|'<='|'<>'|'is'|'is not'|'and'|'or')} operation
 * @property {(SqlWhereComparisonNode|SqlWhereNode)} left
 * @property {(SqlWhereComparisonNode|SqlWhereNode)} right
 */

/**
 * @typedef SqlStatementTree
 * @property {('statement')} type
 * @property {('select')} variant
 * @property {Array<SqlResultNode>} result
 * @property {SqlFromNode} from
 * @property {Array<SqlWhereNode>} where
 */