
/**
 * @function
 * @param {String} sql
 * @returns {Query}
 */
export function parseQuery(sql) {
  const words = normalizeSqlText(sql);

  const query = {};
  query.columns = [];
  let clause;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word === 'select') {
      clause = 'select';
      query.type = 'select';
    } else if (word === 'from') {
      clause = 'from';
    } else {
      switch (clause) {
        case 'select':
          const colName = parseColumnName(word);
          query.columns.push(colName);
          break;
        case 'from':
          const table = parseTableName(word);
          query.from = table;
          break;
        default:
          console.log('Not sure how we got here');
          break;
      }
    }
  }

  query.where = [];

  return query;
}

/**
 * @function
 * @param {String} sql
 * @returns {Array<String>} 
 */
export function normalizeSqlText(sql) {
  // replace newline and tab characters with a space, and replace groups of spaces with a single space
  const normalizedSql = sql.replace('\n', ' ').replace('\t', ' ').replace(/\s\s+/g, ' ');

  const words = normalizedSql.split(' ');

  return words.map(word => word.toLowerCase());
}

/**
 * @function
 * @param {String} colNode 
 * @returns {String}
 */
function parseColumnName(colNode) {
  // remove commas
  const colName = colNode.replace(',', '');

  return colName;
}

/**
 * @function
 * @param {String} tableNode 
 * @returns {QueryTable}
 */
function parseTableName(tableNode) {
  const tableParts = tableNode.split('.');

  const table = {};

  if (tableParts.length == 1) {
    table.schemaName = 'dbo';
    table.tableName = tableParts[0];
  } else if (tableParts.length == 2) {
    table.schemaName = tableParts[0];
    table.tableName = tableParts[1];
  } else {
    throw new Error('We do not support three part naming!');
  }

  return table;
}