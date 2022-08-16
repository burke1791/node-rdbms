import { normalizeSqlText } from './normalizeSql';

/**
 * @function
 * @param {String} sql 
 * @returns {Boolean}
 */
export function validateSyntax(sql) {

  const words = normalizeSqlText(sql);

  if (words[0] !== 'select') return false;

  let clause;
  let isValid = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word === 'select') {
      clause = 'select';
    } else if (word === 'from') {
      clause = 'from';
    } else if (word === 'where') {
      clause = 'where';
    } else {
      isValid = validateSqlClause(clause, words[i - 1] || null, words[i], words[i + 1] || null);

      if (!isValid) return false;
    }
  }

  return isValid;
}

/**
 * @function
 * @param {String} clause 
 * @param {String} prev 
 * @param {String} current 
 * @param {String} next 
 * @returns {Boolean}
 */
function validateSqlClause(clause, prev, current, next) {
  switch (clause) {
    case 'select':
      return validateSelect(prev, current, next);
    case 'from':
      return validateFrom(prev, current, next);
    case 'where':
      return validateWhere(prev, current, next);
    default:
      return false;
  }
}

/**
 * @function
 * @param {String} prev 
 * @param {String} current 
 * @param {String} next 
 * @returns {Boolean}
 */
function validateSelect(prev, current, next) {
  const currentNoComma = current.replace(',', '');
  if (currentNoComma.match(/\W/g)?.length > 0) return false;

  if (prev === 'select' && next !== 'from') {
    // current must not start with a comma
    if (current[0] === ',') return false;

    // current must have a comma separating it from the next word
    if (current[current.length - 1] !== ',' && next != null && next[0] !== ',') return false;

    // current must have exactly one comma between it and next
    if (current[current.length - 1] === ',' && next != null && next[0] === ',') return false;

    // current must not have a trailing comma if next is null
    if (current[current.length - 1] === ',' && next == null) return false;
  } else if (next === 'from') {
    // current must not have a trailing comma
    if (current[current.length - 1] === ',') return false;
  } else {
    // there must be exactly two commas in all three inputs combined
    const combined = `${prev}${current}${next}`;
    if (combined.match(/,/g).length != 2) return false;
  }

  return true;
}

/**
 * @function
 * @param {String} prev 
 * @param {String} current 
 * @param {String} next 
 * @returns {Boolean}
 */
function validateFrom(prev, current, next) {
  if (prev !== 'from' || next != null) return false;

  if (current.match(/[^a-zA-Z0-9_.]/g)?.length > 0) return false;

  return true;
}

/**
 * @function
 * @param {String} prev 
 * @param {String} current 
 * @param {String} next 
 * @returns {Boolean}
 */
function validateWhere(prev, current, next) {
  return false;
}