import { filterResults } from "..";
import sqliteParser from 'sqlite-parser';

describe('filterResults', () => {
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

    const query = 'Select * From test_table Where test = 1';
    const queryTree = sqliteParser(query);
    const where = queryTree.statement[0].where

    expect(filterResults(results, where)).toStrictEqual(expected);
  });

  test('AND', () => {
    const results = [
      [
        {
          name: 'test_id',
          value: 1,
          order: 1
        },
        {
          name: 'obj_id',
          value: 2,
          order: 2
        }
      ],
      [
        {
          name: 'test_id',
          value: 2,
          order: 1
        },
        {
          name: 'obj_id',
          value: 3,
          order: 2
        }
      ]
    ];
    const expected = [
      [
        {
          name: 'test_id',
          value: 1,
          order: 1
        },
        {
          name: 'obj_id',
          value: 2,
          order: 2
        }
      ]
    ];

    const query = 'Select * From test_table Where test_id = 1 And obj_id = 2';
    const queryTree = sqliteParser(query);
    const where = queryTree.statement[0].where
    console.log(where);
    console.log(where[0].left);
    console.log(where[0].right);

    expect(filterResults(results, where)).toStrictEqual(expected);
  });
});