import { getColumnDefinitionsByTableObjectId, getNextSequenceValue, getTableObjectByName } from "../system";

/**
 * @function
 * @param {BufferPool} buffer
 * @param {SqlStatementTree} queryTree
 * @param {('USER'|'SYSTEM')} requestor
 * @returns {Number}
 */
export function executeInsert(buffer, queryTree, requestor) {
  /*
    Perform the following actions:
    
    1. Parse query tree
    2. Perform validation on the inserted columns
      2a. Columns exist
      2b. Constraints are satisfied (null/not null, fkey, pkey)
      2c. Don't allow inserts into autoIncremented columns
    3. Loop through inserted records and add them to the page
      3a. Serialize record
      3b. Call page.addRecordToPage
    
  */

  // Setp 1
  const values = queryTree.result.map(row => {
    const columns = [];
    for (let i in row.expression) {
      columns.push({
        name: queryTree.into.columns[i].name,
        value: row.expression[i].value
      });
    }
    return columns;
  });

  // Step 2
  const table = queryTree.into.name.split('.');
  let schemaName;
  let tableName;

  if (table.length == 2) {
    schemaName = table[0];
    tableName = table[1]; 
  } else if (table.length == 1) {
    schemaName = 'dbo';
    tableName = table[0];
  }

  if (schemaName == 'sys' && requestor != 'SYSTEM') throw new Error('You cannot insert into system tables!');

  const objectRecord = getTableObjectByName(buffer, schemaName, tableName);
  const rootPageId = objectRecord.find(col => col.name.toLowerCase() === 'root_page_id').value;
  const tableObjectId = objectRecord.find(col => col.name.toLowerCase() === 'object_id').value;

  const columnDefinitions = getColumnDefinitionsByTableObjectId(buffer, tableObjectId);

  // Step 2a
  for (let col of values[0]) {
    const def = columnDefinitions.find(colDef => colDef.name == col.name);

    if (def == undefined) throw new Error('Column: ' + col.name + ' does not exits');
  }

  // Step 2c
  const autoIncCols = columnDefinitions.filter(colDef => colDef.autoIncrement);

  for (let col of values[0]) {
    if (autoIncCols.some(c => c.name == col.name)) throw new Error('Cannot insert into autoincremented column');
  }

  // Step 3
  if (autoIncCols.length > 0) {
    for (let row of values) {
      for (let col of autoIncCols) {
        const nextSeq = getNextSequenceValue(buffer, tableObjectId, col.columnId);
        row.push({
          name: col.name,
          value: nextSeq
        });
      }
    }
  }

  // Step 4
  return buffer.insertRecords(rootPageId, values, columnDefinitions);
}