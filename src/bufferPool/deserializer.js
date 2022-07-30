
/**
 * @function
 * @param {Number} colNum 
 * @param {Array<String>} offsetArr 
 * @returns {Number}
 */
export function getVariableLengthColumnOffset(colNum, offsetArr) {
  return Number(offsetArr[colNum - 1]);
}

/**
 * @function
 * @param {Number} colNum 
 * @param {Array<String>} offsetArr 
 * @returns {Number}
 */
export function getVariableColumnLength(colNum, offsetArr) {
  const colIndex = colNum - 1;
  if (colIndex == 0) {
    return Number(offsetArr[colIndex]);
  } else {
    return Number(offsetArr[colIndex]) - Number(offsetArr[colIndex - 1]);
  }
}