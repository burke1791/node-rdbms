import { filterResults } from "..";

describe('queryProcessor', () => {
  test('simple', () => {
    const results = [
      [
        {
          name: 'test',
          value: 1,
          order: 1
        }
      ],
      [
        {
          name: 'test',
          value: 2,
          order: 1
        }
      ]
    ];
    const expected = [
      [
        {
          name: 'test',
          value: 1,
          order: 1
        }
      ]
    ];
    const where = [
      {
        type: 'expression',
        format: 'binary',
        variant: 'operation',
        operation: '=',
        left: {
          type: 'identifier',
          variant: 'column',
          name: 'test'
        },
        right: {
          type: 'literal',
          variant: 'decimal',
          value: '1'
        }
      }
    ];

    expect(filterResults(results, where)).toStrictEqual(expected);
  });
});