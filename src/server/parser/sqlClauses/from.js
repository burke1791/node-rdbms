
/**
 * @function
 * @param {Array<String>} from
 * @returns {SqlFromNode}
 */
export function parseFromNode(from) {
  if (from.length == 1) {
    const splitName = from[0].split('.');

    let schema = 'dbo';
    let table;

    if (splitName.length == 1) {
      table = splitName[0];
    } else if (splitName.length == 2) {
      schema = splitName[0];
      table = splitName[1];
    } else {
      throw new Error('Unable to parse from node: ' + from);
    }

    const node = {
      type: 'identifier',
      variant: 'table',
      schemaName: schema,
      tableName: table
    }

    return node;
  } else {
    throw new Error('Cannot parse table aliases: ' + from);
  }
}