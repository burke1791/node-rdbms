import SqlNumber from "./sqlNumber";

/**
 * @class TinyInt
 * @param {String} value
 */
export function TinyInt(value) {
  SqlNumber.call(this, 1, 0, 9, value);
}

/**
 * @class SmallInt
 * @param {String} value
 */
export function SmallInt(value) {
  SqlNumber.call(this, 2, -9, 99, value);
}

/**
 * @class Int
 * @param {String} value
 */
export function Int(value) {
  SqlNumber.call(this, 4, -999, 9999, value);
}

/**
 * @class BigInt
 * @param {String} value
 */
export function BigInt(value) {
  SqlNumber.call(this, 8, -9999999, 99999999, value);
}