import { SQL_CLAUSES } from '../../utilities/constants';
import { parseFromNode } from './sqlClauses/from';
import { normalizeSqlText } from './normalizeSql';
import { parseSelectResultArray } from './sqlClauses/select';
import { parseWhereNode } from './sqlClauses/where';

/**
 * @function
 * @param {String} sql
 * @returns {SqlStatementTree}
 */
export function parser(sql) {
  const words = normalizeSqlText(sql);

  const tree = generateSelectTree(words);

  return tree;
}

/**
 * @function
 * @param {Array<String>} words 
 * @returns {SqlStatementTree}
 */
function generateSelectTree(words) {
  const tree = {
    type: 'statement',
    variant: 'select'
  };

  const resultBegin = 1;
  const fromIndex = words.indexOf('from');
  let resultEnd = fromIndex;

  if (resultEnd == -1) resultEnd = words.length;

  tree.result = parseSelectResultArray(words.slice(resultBegin, resultEnd));

  const whereIndex = words.indexOf('where');

  if (fromIndex > 0) {
    let fromEnd = whereIndex;

    if (fromEnd == -1) fromEnd = words.length;

    tree.from = parseFromNode(words.slice(fromIndex + 1, fromEnd));
  }

  const groupBy = words.indexOf('group by');
  const orderBy = words.indexOf('order by');

  if (whereIndex > 0) {
    let whereEnd = groupBy == -1 ? (orderBy == -1 ? words.length : orderBy) : groupBy;

    tree.where = parseWhereNode(words.slice(whereIndex + 1, whereEnd));
  }

  return tree;
}







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