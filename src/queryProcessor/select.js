import { BufferPool } from '../bufferPool';
import { getColumnDefinitionsByTableObjectId, getTableObjectByName } from '../system';
import { filterResults } from './where';

/**
 * @function
 * @param {BufferPool} buffer
 * @param {SqlStatementTree} queryTree
 * @returns {Array<Array<ResultCell>>}
 */
export function executeSelect(buffer, queryTree) {
  /*
    Currently allowing single-table queries only
  */

  const table = queryTree.from.name.split('.');
  let schemaName;
  let tableName;

  if (table.length == 2) {
    schemaName = table[0];
    tableName = table[1]; 
  } else if (table.length == 1) {
    schemaName = 'dbo';
    tableName = table[0];
  }
  
  const objectRecord = getTableObjectByName(buffer, schemaName, tableName);
  const rootPageId = objectRecord.find(col => col.name.toLowerCase() === 'root_page_id').value;
  const tableObjectId = objectRecord.find(col => col.name.toLowerCase() === 'object_id').value;

  const columnDefinitions = getColumnDefinitionsByTableObjectId(buffer, tableObjectId);
  
  const results = buffer.pageScan(rootPageId, queryTree.where, columnDefinitions, []);

  const filteredResults = filterResultColumns(results, queryTree);

  return filteredResults;
}

/**
 * @functions
 * @param {Array<Array<ResultCell>>} results 
 * @param {SqlStatementTree} queryTree 
 * @returns {Array<Array<ResultCell>>}
 */
function filterResultColumns(results, queryTree) {
  if (queryTree.result[0].variant != 'star') {
    const prunedResults = results.map(row => {
      const columns = row.filter(col => {
        const matchedCol = queryTree.result.find(res => res.type == 'identifier' && res.name === col.name.toLowerCase());

        if (matchedCol == undefined) return false;
        return true;
      });

      return columns;
    });

    return prunedResults;
  }

  return results;
}