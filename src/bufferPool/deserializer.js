import { Int, SmallInt, TinyInt, BigInt, Bit, Char } from '../dataTypes';

/**
 * @function
 * @param {Number} recordIndex 
 * @param {String} pageData 
 * @param {Array<ColumnDefinition>} columnDefinitions 
 * @returns {Array<ResultCell>}
 */
export function deserializeRecord(recordIndex, pageData, columnDefinitions) {
  const fixedLengthDefinitions = columnDefinitions.filter(def => {
    return !def.isVariable;
  });
  fixedLengthDefinitions.sort((a, b) => a.order - b.order);

  const variableLengthDefinitions = columnDefinitions.filter(def => {
    return def.isVariable;
  });
  variableLengthDefinitions.sort((a, b) => a.order - b.order);

  const numFixed = fixedLengthDefinitions.length;
  const numVariable = variableLengthDefinitions.length;

  const nullBitmapOffset = pageData.substring(recordIndex, recordIndex + 4);
  const nullBitmapStart = recordIndex + Number(nullBitmapOffset);
  const nullBitmapSize = Number(pageData.substring(nullBitmapStart, nullBitmapStart + 2));
  const nullBitmapEnd = nullBitmapStart + nullBitmapSize;
  const nullBitmap = pageData.substring(nullBitmapStart, nullBitmapEnd);
  const nullBitmapColumns = nullBitmap.substring(2).split('');

  const varOffsetEnd = nullBitmapEnd + 2 + (4 * numVariable);

  const varOffsetArray = pageData.substring(nullBitmapEnd, varOffsetEnd);
  const varOffsetColumns = varOffsetArray.substring(2).match(/[\s\S]{1,4}/g);

  const columns = [];
  let colNum = 1;

  for (let i = 0; i < nullBitmapColumns.length; i++) {
    if (nullBitmapColumns[i] == '1' && colNum > numFixed) {
      const val = getVariableLengthNullValue(colNum - numFixed, variableLengthDefinitions);
      columns.push(val);
    } else if (nullBitmapColumns[i] == '1') {
      const val = getFixedLengthNullValue(colNum, fixedLengthDefinitions);
      columns.push(val);
    } else if (colNum > numFixed) {
      // variable length columns
      const offset = getVariableLengthColumnOffset(colNum - numFixed, varOffsetColumns);
      const colLength = getVariableColumnLength(colNum - numFixed, 
      varOffsetColumns);
      const colStart = varOffsetEnd + offset - colLength;
      const col = pageData.substring(colStart, colStart + colLength);
      const val = getVariableLengthColumnValue(colNum - numFixed, variableLengthDefinitions, col);
      columns.push(val);
    } else {
      // fixed length columns
      const [colStart, colEnd] = getFixedColumnValueIndexes(colNum, fixedLengthDefinitions, nullBitmapColumns);
      const col = pageData.substring(colStart + recordIndex, colEnd + recordIndex);
      const val = getFixedLengthColumnValue(colNum, fixedLengthDefinitions, col);
      columns.push(val);
    }

    colNum++;
  }

  columns.sort((a, b) => a.order - b.order);

  return columns;
}

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
export function getFixedColumnValueIndexes(colNum, fixedDefinitions, nullBitmapColumns) {
  const colIndex = colNum - 1;
  let colStart = 4;
  let size = 0;

  for (let i in fixedDefinitions) {
    if (nullBitmapColumns[i] == '0') {
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
          size = fixedDefinitions[i].maxLength;
          break;
        default:
          throw new Error(`Unhandled data type: ${fixedDefinitions[i].dataType} in function getNullBitmapAndNullBitmapOffset`);
      }

      if (i == colIndex) {
        return [colStart, colStart + size];
      }

      colStart += size;
    }
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
  const name = fixedDefinitions[colIndex].name;
  const dataType = fixedDefinitions[colIndex].dataType;
  const order = fixedDefinitions[colIndex].order

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
      const bool = data == '0' ? false : true;
      col = new Bit(bool);
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
    value: null,
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
    value: null,
    order: order
  };
}

/**
 * @function
 * @param {String} name 
 * @param {String} header 
 * @returns {String}
 */
export function getHeaderValue(name, header) {
  switch (name) {
    case 'fileId':
      return header.substring(0, 2);
    case 'pageId':
      return header.substring(2, 6);
    case 'pageType':
      return header.substring(6, 7);
    case 'pageLevel':
      return header.substring(7, 9);
    case 'prevPageId':
      return header.substring(9, 13);
    case 'nextPageId':
      return header.substring(13, 17);
    case 'recordCount':
      return header.substring(17, 21);
    case 'freeCount':
      return header.substring(21, 25);
    case 'reservedCount':
      return header.substring(25, 29);
    case 'firstFreeData':
      return header.substring(29, 33);
    default:
      throw new Error('Unsupported page header attribute');
  }
}