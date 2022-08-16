
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