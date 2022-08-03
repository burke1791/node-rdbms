
/**
 * @function
 * @param {Page} page 
 * @param {(String|Number)} keyToCheck 
 * @returns {Boolean}
 */
export function isDuplicateKey(page, keyToCheck) {
  const rows = page.selectAll();

  for (let row of rows) {
    const keyCol = row.find(col => col.name.toLowerCase() === 'employeeid');

    if (Number(keyCol.value) === Number(keyToCheck)) return true;
  }

  return false;
}