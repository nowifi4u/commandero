import { basicExtractor } from '../../../src/arguments/extractors/basicExtractor';
import { makeExtractAllArguments } from './util';

const split = makeExtractAllArguments(basicExtractor);

test('Test', () => {
  expect(split('arg1')).toEqual(['arg1']);
  expect(split('arg1 arg2')).toEqual(['arg1', 'arg2']);
  expect(split('arg1 arg2 arg3')).toEqual(['arg1', 'arg2', 'arg3']);
});

test('Test mixed', () => {
  expect(split('"arg0 arg1" \\"arg2 arg3\\" \'arg4 arg5\' \\\'arg6 arg7\\\' arg8\\ arg9')).toEqual(['"arg0', 'arg1"', '\\"arg2', 'arg3\\"', "'arg4", "arg5'", "\\'arg6", "arg7\\'", 'arg8\\', 'arg9']);
});
