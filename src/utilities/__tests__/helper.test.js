import { padNumber, padStringTrailing } from '../helper';

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
})