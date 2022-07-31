import { Int, SmallInt, TinyInt, BigInt, Bit, Char } from "../dataTypes";

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

/**
 * @function
 * @param {Number} colNum
 * @param {Array<Object>} fixedDefinitions
 * @returns {Array<Number>}
 */
export function getFixedColumnValueIndexes(colNum, fixedDefinitions) {
  const colIndex = colNum - 1;
  let colStart = 4;
  let size = 0;

  for (let i in fixedDefinitions) {
    switch (fixedDefinitions[i].dataType) {
      case 0:
        size = 1;
        break;
      case 1:
        size = 2;
        break;
      case 2:
        size = 4;
        break;
      case 3:
        size = 8;
        break;
      case 4:
        size = 1;
        break;
      case 5:
        size = col.maxLength;
        break;
      default:
        throw new Error(`Unhandled data type: ${col.dataType} in function getNullBitmapAndNullBitmapOffset`);
    }

    if (i == colIndex) {
      return [colStart, colStart + size];
    }

    colStart += size;
  }

  throw new Error('Incorrect number of fixed-length columns');
}

/**
 * @function
 * @param {Number} colNum 
 * @param {Array<Object>} fixedDefinitions 
 * @param {String} data 
 */
export function getFixedLengthColumnValue(colNum, fixedDefinitions, data) {
  const colIndex = colNum - 1;
  const { name, dataType, order } = fixedDefinitions[colIndex];

  let col;

  switch (dataType) {
    case 0:
      col = new TinyInt(data);
      break;
    case 1:
      col = new SmallInt(data);
      break;
    case 2:
      col = new Int(data);
      break;
    case 3:
      col = new BigInt(data);
      break;
    case 4:
      col = new Bit(data);
      break;
    case 5:
      col = new Char(data);
      break;
    default:
      throw new Error(`Unhandled data type: ${dataType} in getFixedLengthColumnValue`);
  }

  return {
    name: name,
    value: col.value,
    order: order
  };
}

export function getFixedLengthNullValue(colNum, fixedDefinitions) {
  const colIndex = colNum - 1;
  const { name, order } = fixedDefinitions[colIndex];

  return {
    name: name,
    value: 'NULL',
    order: order
  };
}

export function getVariableLengthColumnValue(colNum, variableDefinitions, data) {
  const colIndex = colNum - 1;
  const { name, order } = variableDefinitions[colIndex];

  return {
    name: name,
    value: data,
    order: order
  };
}

export function getVariableLengthNullValue(colNum, variableDefinitions) {
  const colIndex = colNum - 1;
  const { name, order } = variableDefinitions[colIndex];

  return {
    name: name,
    value: 'NULL',
    order: order
  };
}