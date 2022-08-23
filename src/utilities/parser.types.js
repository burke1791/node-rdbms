
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
 * @property {Array<SqlResultNode>} [result]
 * @property {SqlIntoNode} [into]
 * @property {Array<SqlSetNode>} [set]
 * @property {SqlFromNode} [from]
 * @property {Array<SqlWhereNode>} [where]
 */

/**
 * @typedef SqlIntoNode
 * @property {('identifier')} type
 * @property {('column')} variant
 * @property {String} name
 */

/**
 * @typedef SqlSetTargetNode
 * @property {('identifier'|'expression')} type
 * @property {('column')} variant
 * @property {String} name
 */

/**
 * @typedef SqlSetValueNode
 * @property {('identifier'|'expression'|'literal')} type
 * @property {('binary')} [format]
 * @property {('operation'|'column'|'decimal')} [variant]
 * @property {('+'|'-'|'/'|'*')} [operation]
 * @property {String} [name]
 * @property {String} [value]
 * @property {SqlSetValueNode} [left]
 * @property {SqlSetValueNode} [right]
 */

/**
 * @typedef SqlSetNode
 * @property {('assignment')} type
 * @property {SqlSetTargetNode} target
 * @property {SqlSetValueNode} value
 */

/**
 * @typedef SqlDefinition
 * @property {('constraint')} type
 * @property {('primary key'|'not null')} variant
 * @property {Boolean} [autoIncrement]
 */

/**
 * @typedef SqlDefinitionArgNode
 * @property {('expression')} type
 * @property {('list')} variant
 * @property {Array<SqlDefinitionArg>} expression
 */

/**
 * @typedef SqlDefinitionArg
 * @property {('literal')} type
 * @property {('decimal')} variant
 * @property {String} value
 */

/**
 * @typedef SqlDataTypeNode
 * @property {('datatype')} type
 * @property {('tinyint'|'smallint'|'int'|'bigint'|'bit'|'varchar'|'char')} variant
 * @property {SqlDefinitionArgNode} [args]
 */

/**
 * @typedef SqlDefinitionNode
 * @property {('definition')} type
 * @property {('column')} variant
 * @property {String} name
 * @property {Array<SqlDefinition>} definition
 * @property {SqlDataTypeNode} datatype
 */