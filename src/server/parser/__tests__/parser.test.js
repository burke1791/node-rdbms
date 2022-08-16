import { parser } from "../parser";

describe('parser', () => {
  test('select literal', () => {
    const query = 'select 1';
    const tree = {
      type: 'statement',
      variant: 'select',
      result: [
        {
          type: 'literal',
          variant: 'decimal',
          value: '1'
        }
      ]
    };

    expect(parser(query)).toStrictEqual(tree);
  });

  test('select column from', () => {
    const query = 'select col1 from table';
    const tree = {
      type: 'statement',
      variant: 'select',
      result: [
        {
          type: 'identifier',
          variant: 'column',
          name: 'col1'
        }
      ],
      from: {
        type: 'identifier',
        variant: 'table',
        schemaName: 'dbo',
        tableName: 'table'
      }
    };
    expect(parser(query)).toStrictEqual(tree);
  });

  test('select multi-column from where', () => {
    const query = 'select col1, col2 from table where col1 = 5';
    const tree = {
      type: 'statement',
      variant: 'select',
      result: [
        {
          type: 'identifier',
          variant: 'column',
          name: 'col1'
        },
        {
          type: 'identifier',
          variant: 'column',
          name: 'col2'
        }
      ],
      from: {
        type: 'identifier',
        variant: 'table',
        schemaName: 'dbo',
        tableName: 'table'
      },
      where: [
        {
          type: 'expression',
          format: 'binary',
          variant: 'operation',
          operation: '=',
          left: {
            type: 'identifier',
            variant: 'column',
            name: 'col1'
          },
          right: {
            type: 'literal',
            variant: 'decimal',
            value: '5'
          }
        }
      ]
    };
    expect(parser(query)).toStrictEqual(tree);
  })
});