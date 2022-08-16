
/**
 * @function
 * @param {Array<Array<ResultCell>>} results 
 * @param {Array<SqlWhereNode>} where
 * @returns {Array<Array<ResultCell>>}
 */
export function filterResults(results, where) {
  if (where.length == 0) return results;

  return results.filter(row => {
    return evaluateRow(row, where);
  });
}

/**
 * @function
 * @param {Array<ResultCell>} row 
 * @param {Array<SqlWhereNode>} where 
 * @returns {Boolean}
 */
function evaluateRow(row, where) {
  for (let node of where) {
    if (!evaluateSubtree(row, node)) return false;
  }
  return true;
}

/**
 * @function
 * @param {Array<ResultCell>} row 
 * @param {SqlWhereNode} where 
 * @returns {(Boolean|String|Number)}
 */
function evaluateSubtree(row, tree) {
  if (tree.type == 'identifier') {
    const col = row.find(col => col.name === tree.name);

    if (col == undefined) {
      console.log(tree);
      console.log(row);
      throw new Error('Unable to match tree (left) identifier to column');
    }

    return col.value;
  } else if (tree.type == 'literal') {
    let value;

    switch (tree.variant) {
      case 'decimal':
        value = Number(tree.value);
        break;
      case 'text':
        value = tree.value;
        break;
      case 'null':
        value = null;
        break;
      default:
        throw new Error('Invalid right tree variant');
    }

    return value;
  } else {
    const left = evaluateSubtree(row, tree.left);
    const right = evaluateSubtree(row, tree.right);

    return left == right;
  }
}