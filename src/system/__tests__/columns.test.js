import { BufferPool } from '../../bufferPool';
import { generateBlankPage } from '../../bufferPool/serializer';
import { writePageToDisk } from '../../storageEngine';
import { getNewColumnInsertValues, initColumnsTableDefinition, initializeColumnsTable, _getNewColumnInsertValues } from '../columns';
import { getNextSequenceValue } from '../sequences';

jest.mock('../sequences', () => {
  const original = jest.requireActual('../sequences');
  return {
    __esModule: true,
    ...original,
    getNextSequenceValue: jest.fn(() => 7)
  }
});
jest.mock('../../bufferPool');
jest.mock('../../storageEngine', () => {
  const original = jest.requireActual('../../storageEngine');
  return {
    __esModule: true,
    ...original,
    writePageToDisk: jest.fn()
  }
});

describe('initializeColumnsTable', () => {
  test('normal use', () => {
    const blankPage = generateBlankPage(1, 3, 1);
    const buffer = new BufferPool();
    buffer.loadPageIntoMemory = jest.fn();

    initializeColumnsTable(buffer);

    expect(writePageToDisk).toHaveBeenCalledWith('data', blankPage);
    expect(buffer.loadPageIntoMemory).toHaveBeenCalledWith('data', 3);
  });
});

describe('initColumnsTableDefinition', () => {
  test('normal use', () => {
    const buffer = new BufferPool();
    buffer.executeSystemColumnInsert = jest.fn();

    initColumnsTableDefinition(buffer, 1);

    expect(buffer.executeSystemColumnInsert).toHaveBeenCalledTimes(8);
  });
});

describe('_getNewColumnInsertValues', () => {
  test('normal use', () => {
    const expected = [
      {
        name: 'column_id',
        value: 1
      },
      {
        name: 'parent_object_id',
        value: 2
      },
      {
        name: 'data_type',
        value: 3
      },
      {
        name: 'is_variable',
        value: true
      },
      {
        name: 'is_nullable',
        value: false
      },
      {
        name: 'max_length',
        value: 4
      },
      {
        name: 'column_name',
        value: 'test'
      },
      {
        name: 'column_order',
        value: 5
      }
    ];

    expect(_getNewColumnInsertValues(1, 2, 3, true, false, 4, 'test', 5)).toStrictEqual(expected);
  });
});

describe('getNewColumnInsertValues', () => {
  test('normal use', () => {
    const buffer = new BufferPool();

    const expected = [
      {
        name: 'column_id',
        value: 7
      },
      {
        name: 'parent_object_id',
        value: 2
      },
      {
        name: 'data_type',
        value: 1
      },
      {
        name: 'is_variable',
        value: true
      },
      {
        name: 'is_nullable',
        value: false
      },
      {
        name: 'max_length',
        value: 100
      },
      {
        name: 'column_name',
        value: 'test'
      },
      {
        name: 'column_order',
        value: 5
      }
    ];
    const actual = getNewColumnInsertValues(buffer, 2, 1, true, false, 100, 'test', 5);

    expect(actual).toStrictEqual(expected);
    expect(getNextSequenceValue).toHaveBeenCalledWith(buffer, 4);
  });
});