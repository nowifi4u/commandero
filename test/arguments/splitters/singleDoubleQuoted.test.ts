import { makeQuoteEscapeExtractor } from '../../../src/arguments/extractors/quoteEscapeExtractor';
import { makeExtractAllArguments } from './util';

const split = makeExtractAllArguments(makeQuoteEscapeExtractor());

test('Test regular', () => {
  expect(split('arg1')).toEqual(['arg1']);
  expect(split('arg1 arg2')).toEqual(['arg1', 'arg2']);
  expect(split('arg1 arg2 arg3')).toEqual(['arg1', 'arg2', 'arg3']);
});

describe('Test single quoted', () => {
  test('Enabled', () => {
    expect(split('\'arg11\'')).toEqual(['arg11']);
    expect(split('\'arg11 arg12\'')).toEqual(['arg11 arg12']);
    expect(split('\'arg11 arg12 arg13\'')).toEqual(['arg11 arg12 arg13']);

    expect(split('\'arg11\' \'arg12\'')).toEqual(['arg11', 'arg12']);
    expect(split('\'arg11 arg12\' \'arg21 arg22\'')).toEqual(['arg11 arg12', 'arg21 arg22']);
    expect(split('\'arg11 arg12 arg13\' \'arg21 arg22 arg23\'')).toEqual(['arg11 arg12 arg13', 'arg21 arg22 arg23']);

    expect(split('\'arg11\' arg21 \'arg31\'')).toEqual(['arg11', 'arg21', 'arg31']);
    expect(split('\'arg11 arg12\' arg21 \'arg31 arg32\'')).toEqual(['arg11 arg12', 'arg21', 'arg31 arg32']);
    expect(split('\'arg11 arg12 arg13\' arg21 \'arg31 arg32 arg33\'')).toEqual(['arg11 arg12 arg13', 'arg21', 'arg31 arg32 arg33']);

    expect(split('arg11 \'arg21\' arg31')).toEqual(['arg11', 'arg21', 'arg31']);
    expect(split('arg11 \'arg21 arg22\' arg31')).toEqual(['arg11', 'arg21 arg22', 'arg31']);
    expect(split('arg11 \'arg21 arg22 arg23\' arg31')).toEqual(['arg11', 'arg21 arg22 arg23', 'arg31']);
  });

  const splitDisabled = makeExtractAllArguments(makeQuoteEscapeExtractor({ disableSingleQuote: true }));

  test('Disabled', () => {
    expect(splitDisabled('\'arg11\'')).toEqual(['\'arg11\'']);
    expect(splitDisabled('\'arg11 arg12\'')).toEqual(['\'arg11', 'arg12\'']);
    expect(splitDisabled('\'arg11 arg12 arg13\'')).toEqual(['\'arg11', 'arg12', 'arg13\'']);

    expect(splitDisabled('\'arg11\' \'arg12\'')).toEqual(['\'arg11\'', '\'arg12\'']);
    expect(splitDisabled('\'arg11 arg12\' \'arg21 arg22\'')).toEqual(['\'arg11', 'arg12\'', '\'arg21', 'arg22\'']);
    expect(splitDisabled('\'arg11 arg12 arg13\' \'arg21 arg22 arg23\'')).toEqual(['\'arg11', 'arg12', 'arg13\'', '\'arg21', 'arg22', 'arg23\'']);

    expect(splitDisabled('\'arg11\' arg21 \'arg31\'')).toEqual(['\'arg11\'', 'arg21', '\'arg31\'']);
    expect(splitDisabled('\'arg11 arg12\' arg21 \'arg31 arg32\'')).toEqual(['\'arg11', 'arg12\'', 'arg21', '\'arg31', 'arg32\'']);
    expect(splitDisabled('\'arg11 arg12 arg13\' arg21 \'arg31 arg32 arg33\'')).toEqual(['\'arg11', 'arg12', 'arg13\'', 'arg21', '\'arg31', 'arg32', 'arg33\'']);

    expect(splitDisabled('arg11 \'arg21\' arg31')).toEqual(['arg11', '\'arg21\'', 'arg31']);
    expect(splitDisabled('arg11 \'arg21 arg22\' arg31')).toEqual(['arg11', '\'arg21', 'arg22\'', 'arg31']);
    expect(splitDisabled('arg11 \'arg21 arg22 arg23\' arg31')).toEqual(['arg11', '\'arg21', 'arg22', 'arg23\'', 'arg31']);
  });

  test('ERROR unmatched single quote', () => {
    expect(() => split('\'arg11')).toThrow();
    expect(() => split('arg11\'')).toThrow();
    expect(() => split('\'arg11\' \'arg21')).toThrow();
    expect(() => split('\'arg11\' arg21\'')).toThrow();
  });

  test('ERROR text before quote', () => {
    expect(() => split('arg1\'arg2'));
  });

  test('ERROR text after quote', () => {
    expect(() => split('\'arg1\'arg2'));
  });
});

describe('Test double quoted', () => {
  test('Enabled', () => {
    expect(split('"arg11"')).toEqual(['arg11']);
    expect(split('"arg11 arg12"')).toEqual(['arg11 arg12']);
    expect(split('"arg11 arg12 arg13"')).toEqual(['arg11 arg12 arg13']);

    expect(split('"arg11" "arg12"')).toEqual(['arg11', 'arg12']);
    expect(split('"arg11 arg12" "arg21 arg22"')).toEqual(['arg11 arg12', 'arg21 arg22']);
    expect(split('"arg11 arg12 arg13" "arg21 arg22 arg23"')).toEqual(['arg11 arg12 arg13', 'arg21 arg22 arg23']);

    expect(split('"arg11" arg21 "arg31"')).toEqual(['arg11', 'arg21', 'arg31']);
    expect(split('"arg11 arg12" arg21 "arg31 arg32"')).toEqual(['arg11 arg12', 'arg21', 'arg31 arg32']);
    expect(split('"arg11 arg12 arg13" arg21 "arg31 arg32 arg33"')).toEqual(['arg11 arg12 arg13', 'arg21', 'arg31 arg32 arg33']);

    expect(split('arg11 "arg21" arg31')).toEqual(['arg11', 'arg21', 'arg31']);
    expect(split('arg11 "arg21 arg22" arg31')).toEqual(['arg11', 'arg21 arg22', 'arg31']);
    expect(split('arg11 "arg21 arg22 arg23" arg31')).toEqual(['arg11', 'arg21 arg22 arg23', 'arg31']);
  });

  const splitDisabled = makeExtractAllArguments(makeQuoteEscapeExtractor({ disableDoubleQuote: true }));

  test('Disabled', () => {
    expect(splitDisabled('"arg11"')).toEqual(['"arg11"']);
    expect(splitDisabled('"arg11 arg12"')).toEqual(['"arg11', 'arg12"']);
    expect(splitDisabled('"arg11 arg12 arg13"')).toEqual(['"arg11', 'arg12', 'arg13"']);

    expect(splitDisabled('"arg11" "arg12"')).toEqual(['"arg11"', '"arg12"']);
    expect(splitDisabled('"arg11 arg12" "arg21 arg22"')).toEqual(['"arg11', 'arg12"', '"arg21', 'arg22"']);
    expect(splitDisabled('"arg11 arg12 arg13" "arg21 arg22 arg23"')).toEqual(['"arg11', 'arg12', 'arg13"', '"arg21', 'arg22', 'arg23"']);

    expect(splitDisabled('"arg11" arg21 "arg31"')).toEqual(['"arg11"', 'arg21', '"arg31"']);
    expect(splitDisabled('"arg11 arg12" arg21 "arg31 arg32"')).toEqual(['"arg11', 'arg12"', 'arg21', '"arg31', 'arg32"']);
    expect(splitDisabled('"arg11 arg12 arg13" arg21 "arg31 arg32 arg33"')).toEqual(['"arg11', 'arg12', 'arg13"', 'arg21', '"arg31', 'arg32', 'arg33"']);

    expect(splitDisabled('arg11 "arg21" arg31')).toEqual(['arg11', '"arg21"', 'arg31']);
    expect(splitDisabled('arg11 "arg21 arg22" arg31')).toEqual(['arg11', '"arg21', 'arg22"', 'arg31']);
    expect(splitDisabled('arg11 "arg21 arg22 arg23" arg31')).toEqual(['arg11', '"arg21', 'arg22', 'arg23"', 'arg31']);
  });

  test('ERROR unmatching double quote', () => {
    expect(() => split('"arg11')).toThrow();
    expect(() => split('arg11"')).toThrow();
    expect(() => split('"arg11" "arg21')).toThrow();
    expect(() => split('"arg11" arg21"')).toThrow();
  });

  test('ERROR text before quote', () => {
    expect(() => split('arg1"arg2'));
  });

  test('ERROR text after quote', () => {
    expect(() => split('"arg1"arg2'));
  });
});

describe('Test double quote in quoted', () => {
  test('Enabled', () => {
    expect(split('\'"arg11"\'')).toEqual(['"arg11"']);
    expect(split('\'"arg11" "arg12"\'')).toEqual(['"arg11" "arg12"']);
    expect(split('\'"arg11" "arg12" "arg13"\'')).toEqual(['"arg11" "arg12" "arg13"']);
  });
});

describe('Test quote in double quoted', () => {
  test('Enabled', () => {
    expect(split('"\'arg11\'"')).toEqual(['\'arg11\'']);
    expect(split('"\'arg11\' \'arg12\'"')).toEqual(['\'arg11\' \'arg12\'']);
    expect(split('"\'arg11\' \'arg12\' \'arg13\'"')).toEqual(['\'arg11\' \'arg12\' \'arg13\'']);
  });
});

describe('Test escape', () => {
  test('Enabled', () => {
    expect(split('\\a \\1 \\\\ \\  \\\' \\"')).toEqual(['a', '1', '\\', ' ', '\'', '"']);
  });

  const splitDisabled = makeExtractAllArguments(makeQuoteEscapeExtractor({ disableEscape: true }));

  test('Disabled', () => {
    expect(splitDisabled('\\a \\1 \\\\ \\ ')).toEqual(['\\a', '\\1', '\\\\', '\\']);
  });
});

test('Test mixed', () => {
  expect(split('"arg0 arg1" \\"arg2 arg3\\" \'arg4 arg5\' \\\'arg6 arg7\\\' arg8\\ arg9')).toEqual(['arg0 arg1', '"arg2', 'arg3"', 'arg4 arg5', '\'arg6', 'arg7\'', 'arg8 arg9']);
});
