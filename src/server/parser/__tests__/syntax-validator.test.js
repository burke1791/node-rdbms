import { validateSyntax } from "../syntax-validator"

describe('validateSyntax', () => {
  test('no select', () => {
    const query = 'Hello';
    expect(validateSyntax(query)).toBe(false);
  });

  test('select only - no column', () => {
    const query = 'select';
    expect(validateSyntax(query)).toBe(false);
  });

  test('select only - good', () => {
    const query = 'select 1';
    expect(validateSyntax(query)).toBe(true);
  });

  test('select only - leading comma', () => {
    const query = 'select ,col1';
    expect(validateSyntax(query)).toBe(false);
  });

  test('select only - no comma', () => {
    const query = 'select col1 col2';
    expect(validateSyntax(query)).toBe(false);
  });

  test('select only - too many commas', () => {
    const query = 'select col1, ,col2';
    expect(validateSyntax(query)).toBe(false);
  });

  test('select only - single column, trailing comma', () => {
    const query = 'select col1,';
    expect(validateSyntax(query)).toBe(false);
  });

  test('select only - multi-column, trailing comma', () => {
    const query = 'select col1,col2,';
    expect(validateSyntax(query)).toBe(false);
  });

  test('from - good', () => {
    const query = 'Select col1 from test';
    expect(validateSyntax(query)).toBe(true);
  });

  test('from - table comma', () => {
    const query = 'select col1 from test,';
    expect(validateSyntax(query)).toBe(false);
  });

  test('from - trailing column comma', () => {
    const query = 'select col1, col2, from test';
    expect(validateSyntax(query)).toBe(false);
  });

  test('from - too many commas', () => {
    const query = 'select col1, col2, ,col3, col4 from test';
    expect(validateSyntax(query)).toBe(false);
  });

  test('from - extra trailers', () => {
    const query = 'select col1 from test test';
    expect(validateSyntax(query)).toBe(false);
  });

  test('from - two-part table name', () => {
    const query = 'select col1, col2, col3 from sys.objects';
    expect(validateSyntax(query)).toBe(true);
  });

  test('where - good', () => {
    const query = 'select * from sys.objects where col1 = 1';
    expect(validateSyntax(query)).toBe(true);
  });
});