import { PAGE_SIZE, EMPTY_SPACE_CHAR } from './constants';

/**
 * Returns a string representation of `value` with leading zeros to fill a string of size `length`
 * @function padNumber
 * @param {Number} value 
 * @param {Number} length 
 * @returns {String}
 */
 export function padNumber(value, length) {
  if (isNaN(value) || isNaN(length)) {
    throw new Error('Inputs must be numbers');
  }
  const numDigits = value.toString().length;

  if (numDigits > length) {
    throw new Error('Number of digits exceeds the allowed length');
  }

  let str = '' + value;

  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

/**
 * Returns a string with trailing spaces in order to fill out a fixed length SqlString object
 * @function padStringTrailing
 * @param {String} value
 * @param {Number} length
 * @returns {String}
 */
export function padStringTrailing(value, length) {
  if (isNaN(length)) throw new Error('length must be a number');

  const currentLength = value.length;

  if (currentLength > length) throw new Error('String exceeds the maximum length');

  let str = value;

  while (str.length < length) {
    str = str + ' ';
  }

  return str;
}

/**
 * @function
 * @param {String|Number} value 
 * @param {Number} length 
 * @param {(left|right)} alignment 
 */
export function pad(value, length, alignment) {
  if (isNaN(length)) throw new Error('length parameter must be a number');
  
  const size = value.toString().length;
  if (size > length) throw new Error('Number of digits exceeds the allowed length');

  let str = '' + value;

  if (alignment === 'right') {
    while (str.length < length) {
      str = ' ' + str;
    }
  } else if (alignment === 'left') {
    while (str.length < length) {
      str = str + ' ';
    }
  } else {
    throw new Error(`Unhandled alignment: ${alignment}`);
  }

  return str;
}

/**
 * @function
 * @param {String} header
 * @param {String} [recordData]
 * @param {String} [slotArray]
 * @returns {String}
 */
export function fillInEmptyPageSpace(header, recordData = '', slotArray = '') {
  let length = header.length + recordData.length + slotArray.length;

  if (length > PAGE_SIZE) throw new Error('Page cannot exceed ' + PAGE_SIZE + ' chars');

  let text = header + recordData;

  while (length < PAGE_SIZE) {
    text = text + EMPTY_SPACE_CHAR;
    length = text.length + slotArray.length;
  }

  return text + slotArray;
}

/**
 * @function
 * @param {String} value 
 * @returns {Number}
 */
export function parseNumberFromPage(value) {
  if (value == null || value == undefined) return null;

  value = String(value);
  // trim leading zeros
  const digits = value.split('');
  let isLeading = true;

  const newDigits = digits.filter(digit => {
    if (digit !== '0') isLeading = false;

    if (isLeading) {
      return digit !== '0';
    }

    return true;
  });

  const number = newDigits.join('');
  return Number(number);
}