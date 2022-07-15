import SqlString from "./sqlString";

/**
 * @class Char
 */
export function Char(value, length) {
  SqlString.call(this, length, false, value);
}

/**
 * @class Varchar
 */
export function Varchar(value, maxLength) {
  /**
   * @todo calculate the actual max length for varchars since we're not doing forwarding records
   */

  if (maxLength == -1) maxLength = 8000;
  SqlString.call(this, maxLength, true, value);
}