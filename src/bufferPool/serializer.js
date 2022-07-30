import { Bit, Char, Varchar } from "../dataTypes";
import { Int, SmallInt, TinyInt } from "../dataTypes/numbers";
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
 */
export function getNullBitmapAndNullBitmapOffset(values, definitions) {
  const fixedLengthDefinitions = definitions.filter(def => {
    return !def.isVariable;
  });

  const variableLengthDefinitions = definitions.filter(def => {
    return def.isVariable;
  });

  let nullBitmap = `${padNumber(definitions.length, 2)}`;
  let offset = 4;

  for (let fdef of fixedLengthDefinitions) {
    
  }

  for (let val of values) {
    const col = definitions.find(def => def.name.toLowerCase() === val.name.toLowerCase());

    if (col.isVariable) {
      switch (col.dataType) {
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
}

/**
 * @function
 * @throws
 * @param {Array<Object>} values 
 * @param {Array<Object>} definitions
 * @returns {Boolean}
 */
export function validateValues(values, definitions) {
  for (let val of values) {
    const col = definitions.find(def => def.name.toLowerCase() === val.name.toLowerCase());
    const isValid = validateDataType(value, col.dataType, col.isNullable, col.maxLength);
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