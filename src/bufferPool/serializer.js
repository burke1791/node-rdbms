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