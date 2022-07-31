import { Bit, Char, Varchar } from "../dataTypes";
import { Int, SmallInt, TinyInt, BigInt } from "../dataTypes/numbers";
import { padNumber } from "../utilities/helper";

/**
 * @function
 * @param {String} headerData 
 * @param {String} recordData 
 * @param {String} slotArray 
 * @returns {String}
 */
export function fillInEmptyPageSpace(headerData, recordData, slotArray) {
  
}

/**
 * @function
 * @param {Array<Object>} values 
 * @param {Array<Object>} definitions
 * @returns {Array<Any>}
 */
export function getNullBitmapAndNullBitmapOffset(values, definitions) {
  const fixedLengthDefinitions = definitions.filter(def => {
    return !def.isVariable;
  });

  fixedLengthDefinitions.sort((a, b) => a.order - b.order);

  const variableLengthDefinitions = definitions.filter(def => {
    return def.isVariable;
  });

  variableLengthDefinitions.sort((a, b) => a.order - b.order);

  let nullBitmap = `${padNumber(definitions.length + 2, 2)}`;
  let offset = 4;

  for (let fdef of fixedLengthDefinitions) {
    const val = values.find(value => value.name.toLowerCase() === fdef.name.toLowerCase());

    if (val == undefined || val == null || val.value == undefined || val.value == null) {
      nullBitmap += '1';
    } else {
      nullBitmap += '0';

      switch (fdef.dataType) {
        case 0:
          offset += 1;
          break;
        case 1:
          offset += 2;
          break;
        case 2:
          offset += 4;
          break;
        case 3:
          offset += 8;
          break;
        case 4:
          offset += 1;
          break;
        case 5:
          offset += col.maxLength;
          break;
        default:
          throw new Error(`Unhandled data type: ${col.dataType} in function getNullBitmapAndNullBitmapOffset`);
      }
    }
  }

  for (let vdef of variableLengthDefinitions) {
    const val = values.find(value => value.name.toLowerCase() === vdef.name.toLowerCase());

    if (val == undefined || val == null || val.value == undefined || val.value == null) {
      nullBitmap += '1';
    } else {
      nullBitmap += '0';
    }
  }

  return [nullBitmap, offset];
}

/**
 * @function
 * @throws
 * @param {Array<Object>} values 
 * @param {Array<Object>} definitions
 * @returns {Boolean}
 */
export function validateInsertValues(values, definitions) {
  for (let def of definitions) {
    const val = values.find(value => value.name.toLowerCase() === def.name.toLowerCase());
    const isValid = validateDataType(val.value, def.dataType, def.isNullable, def.maxLength);
  }

  return true;
}

/**
 * @function
 * @throws
 * @param {any} value 
 * @param {Number} dataType 
 * @param {Boolean} isNullable 
 * @param {Number} maxLength 
 * @returns {Boolean}
 */
export function validateDataType(value, dataType, isNullable, maxLength) {
  if (!isNullable && value == null) throw new Error('Value cannot be Null');

  let colVal;

  switch (dataType) {
    case 0:
      colVal = new TinyInt(value);
      return true;
    case 1:
      colVal = new SmallInt(value);
      return true;
    case 2:
      colVal = new Int(value);
      return true;
    case 3:
      colVal = new BigInt(value);
      return true;
    case 4:
      colVal = new Bit(value);
      return true;
    case 5:
      colVal = new Char(value, maxLength);
      return true;
    case 6:
      colVal = new Varchar(value, maxLength);
      return true;
  }
}

/**
 * @function
 * @param {Array<Object>} values
 * @param {Array<Object>} definitions
 * @returns {String}
 */
export function getVariableOffsetArray(values, definitions) {
  const variableDefinitions = definitions.filter(def => {
    return def.isVariable;
  });

  let offsetArr = padNumber(variableDefinitions.length, 2);
  let prevOffset = 0;

  for (let vdef of variableDefinitions) {
    const col = values.find(value => value.name.toLowerCase() === vdef.name.toLowerCase());

    if (col == undefined || col.value == null || col.value == undefined) {
      offsetArr += padNumber(prevOffset, 4);
    } else {
      let offset = col.value.length + prevOffset;
      offsetArr += padNumber(offset, 4);
      prevOffset = offset;
    }
  }

  return offsetArr;
}

/**
 * @typedef PageHeaderChangeType
 * @property {String} name
 * @property {Number} value
 */

/**
 * @function
 * @param {Number} pageType 
 * @param {Array<PageHeaderChangeType>} changes 
 * @param {String} [header]
 * @returns {String}
 */
export function updatePageHeader(pageType, changes, header = '') {
  if (header == '' || header == undefined || header == null) {
    header = generateNewPageHeader(pageType);
  }

  changes.forEach(change => {
    header = updateHeaderValue(change.name, change.value, header);
  });

  return header;
}

function generateNewPageHeader(pageType) {
  const fileId = padNumber(1, 2);
  const pageId = padNumber(1, 4);
  const pageLevel = padNumber(0, 2);
  const prevPageId = padNumber(0, 4);
  const nextPageId = padNumber(0, 4);
  const recordCount = padNumber(0, 4);
  const freeCount = padNumber(0, 4);
  const reservedCount = padNumber(0, 4);
  const firstFreeData = padNumber(0, 4);

  return `${fileId}${pageId}${pageType}${pageLevel}${prevPageId}${nextPageId}${recordCount}${freeCount}${reservedCount}${firstFreeData}`;
}

function updateHeaderValue(name, newValue, header) {
  let newValueText = '';
  let before = '';
  let after = '';

  switch (name) {
    case 'prevPageId':
      newValueText = padNumber(newValue, 4);
      before = header.substring(0, 9);
      after = header.substring(13);
      return `${before}${newValueText}${after}`;
    case 'nextPageId':
      newValueText = padNumber(newValue, 4);
      before = header.substring(0, 13);
      after = header.substring(17);
      return `${before}${newValueText}${after}`;
    case 'recordCount':
      newValueText = padNumber(newValue, 4);
      before = header.substring(0, 17);
      after = header.substring(21);
      return `${before}${newValueText}${after}`;
    case 'freeCount':
      newValueText = padNumber(newValue, 4);
      before = header.substring(0, 21);
      after = header.substring(25);
      return `${before}${newValueText}${after}`;
    case 'reservedCount':
      newValueText = padNumber(newValue, 4);
      before = header.substring(0, 25);
      after = header.substring(29);
      return `${before}${newValueText}${after}`;
    case 'firstFreeData':
      newValueText = padNumber(newValue, 4);
      before = header.substring(0, 29);
      return `${before}${newValueText}`;
    default:
      throw new Error('Unhandled page header update type: ' + name);
  }
}