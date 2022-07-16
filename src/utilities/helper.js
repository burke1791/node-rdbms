/**
 * Returns a string representation of `value` with leading zeros to fill a string of size `length`
 * @function padNumber
 * @param {Number} value 
 * @param {Number} length 
 * @returns {String}
 */
 export function padNumber(value, length) {
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
  const currentLength = value.length;

  if (currentLength > length) throw new Error('String exceeds the maximum length');

  let str = value;

  while (str.length < length) {
    str = str + ' ';
  }

  return str;
}