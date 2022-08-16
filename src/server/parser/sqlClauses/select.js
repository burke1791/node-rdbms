
/**
 * @function
 * @param {Array<String>} words 
 * @returns {Array<SqlResultNode>}
 */
export function parseSelectResultArray(words) {
  return words.map(word => {
    const node = {};

    // remove commas
    const name = word.replace(',', '');

    node.type = getSelectResultNodeType(name);
    node.variant = getSelectNodeVariant(node.type, name);

    if (node.type == 'literal') {
      node.value = getSelectNodeValue(node.variant, name);
    } else if (node.type == 'identifier') {
      node.name = getSelectNodeName(node.variant, name);
    }

    return node;
  });
}

/**
 * @function
 * @param {String} name
 * @returns {('identifier'|'literal')}
 */
function getSelectResultNodeType(name) {
  const num = Number(name);

  if (!isNaN(num)) {
    return 'literal';
  } else if (name[0] == '\'' && name[name.length - 1] == '\'') {
    return 'literal';
  } else if (name == 'null') {
    return 'literal';
  }

  return 'identifier';
}

/**
 * @function
 * @param {('identifier'|'literal')} type
 * @param {String} name
 * @returns {('star'|'column'|'decimal'|'text'|'null')}
 */
function getSelectNodeVariant(type, name) {
  if (type == 'identifier' && name == '*') {
    return 'star';
  } else if (type == 'identifier') {
    return 'column';
  } else if (type == 'literal' && !isNaN(Number(name))) {
    return 'decimal';
  } else if (type == 'literal' && name == 'null') {
    return 'null';
  } else if (type == 'literal' && name[0] == '\'' && name[name.length - 1] == '\'') {
    return 'text';
  } else {
    throw new Error('Cannot determine SELECT node variant. type: ' + type + ' | name: ' + name);
  }
}

/**
 * @function
 * @param {('decimal'|'text'|'null')} variant
 * @param {String} name 
 * @returns {String}
 */
function getSelectNodeValue(variant, name) {
  if (variant == 'decimal') {
    return `${Number(name)}`;
  } else if (variant == 'text') {
    return name;
  } else if (variant == 'null') {
    return 'null';
  } else {
    throw new Error('Unknown variant: ' + variant);
  }
}

/**
 * @function
 * @param {('star'|'column')} variant 
 * @param {String} name
 * @returns {String}
 */
function getSelectNodeName(variant, name) {
  if (variant == 'star') {
    return '*';
  } else if (variant == 'column') {
    return name;
  } else {
    throw new Error('Unknown variant: ' + variant);
  }
}