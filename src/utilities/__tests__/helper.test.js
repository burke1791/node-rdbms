import { EMPTY_SPACE_CHAR } from '../constants';
import { fillInEmptyPageSpace, pad, padNumber, padStringTrailing, parseNumberFromPage } from '../helper';

describe('padNumber', () => {
  test('throws NaN - first input', () => {
    expect(() => {
      padNumber('hello', 5);
    }).toThrow();
  });

  test('throws NaN - second input', () => {
    expect(() => {
      padNumber(5, 'hello');
    }).toThrow();
  });

  test('throws when num digits in value exceed the length', () => {
    expect(() => {
      padNumber(1234, 3);
    }).toThrow();
  });

  test('pads correctly', () => {
    expect(padNumber(123, 4)).toBe('0123');
  });

  test('does not pad when not needed', () => {
    expect(padNumber(123, 3)).toBe('123');
  });
});

describe('padStringTrailing', () => {
  test('throws when input exceeds length', () => {
    expect(() => {
      padStringTrailing('hello', 3);
    }).toThrow();
  });

  test('throws when length is not a number', () => {
    expect(() => {
      padStringTrailing('hello', 'hi');
    }).toThrow();
  });

  test('resulting string length matches length input', () => {
    expect(padStringTrailing('hello', 10).length).toBe(10);
  });

  test('trailing pad is filled with the correct characters', () => {
    expect(padStringTrailing('hello', 10)).toBe('hello     ');
  });

  test('throws when input string is longer than specified length', () => {
    expect(() => {
      padStringTrailing('hello', 2);
    }).toThrow();
  });
});

describe('pad', () => {
  test('left alignment', () => {
    expect(pad(2, 5, 'left')).toBe('2    ');
  });

  test('right alignment', () => {
    expect(pad(2, 5, 'right')).toBe('    2');
  });

  test('throws when value exceeds length', () => {
    expect(() => {
      pad('hello', 3, 'left')
    }).toThrow();
  });

  test('throws when length is not a number', () => {
    expect(() => {
      pad('hello', 'howdy', 'left')
    }).toThrow();
  });

  test('throws when invalid alignment is supplied', () => {
    expect(() => {
      pad('hello', 5, 'center')
    }).toThrow();
  });
});

describe('fillInEmptyPageSpace', () => {
  let emptySpace = EMPTY_SPACE_CHAR.repeat(8189);
  let pageData = `12${emptySpace}3`

  test('valid inputs', () => {
    expect(fillInEmptyPageSpace('1', '2', '3')).toBe(pageData);
  });

  let data = `123${emptySpace}123`;

  test('inputs too long', () => {
    expect(() => {
      fillInEmptyPageSpace('1', data, '123')
    }).toThrow();
  });
});

describe('parseNumberFromPage', () => {
  test('valid inputs', () => {
    expect(parseNumberFromPage('0004')).toBe(4);
  });

  test('null', () => {
    expect(parseNumberFromPage(null)).toBe(null);
  });
});