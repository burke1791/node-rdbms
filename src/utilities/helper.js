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

  if (numDigits > length) throw new Error('Number of digits exceeds the allowed length');

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