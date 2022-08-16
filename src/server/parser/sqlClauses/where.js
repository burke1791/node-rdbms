
/**
 * @function
 * @param {Array<String>} where 
 * @returns {Array<SqlWhereNode>}
 */
export function parseWhereNode(where) {
  if (where.length != 3) throw new Error('Cannot handle complex predicates yet');

  let left = where[0];
  let operation = where[1];
  let right = where[2];

  const node = {
    type: 'expression',
    format: 'binary',
    variant: 'operation',
    operation: operation,
    left: parseWhereComparisonNode(left),
    right: parseWhereComparisonNode(right)
  };

  return [node];
}

/**
 * @function
 * @param {String} value
 * @returns {SqlWhereComparisonNode}
 */
function parseWhereComparisonNode(value) {
  const node = {};

  const num = Number(value);
  let type = 'identifier';
  let variant = 'column';

  if (!isNaN(num)) {
    type = 'literal';
    variant = 'decimal';
  } else if (value[0] == '\'' && value[value.length - 1] == '\'') {
    type = 'literal';
    variant = 'text';
  } else if (value == 'null') {
    type = 'literal';
    variant = 'null';
  }

  node.type = type;
  node.variant = variant;

  if (type == 'identifier') {
    node.name = value;
  } else if (type == 'literal') {
    node.value = value;
  }

  return node;
}