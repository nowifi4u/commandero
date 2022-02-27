import { BooleanType } from '../../src/types/Boolean';
import { manager } from '../mock';

const type = new BooleanType(manager(), {
  truthy: ['true', 't'],
  falsy: ['false', 'f'],
});

test('Truthy values', () => {
  expect(type.run('true')).toEqual(true);
  expect(type.run('TRUE')).toEqual(true);
  expect(type.run('TrUe')).toEqual(true);

  expect(type.run('t')).toEqual(true);
  expect(type.run('T')).toEqual(true);
});

test('Falsy values', () => {
  expect(type.run('false')).toEqual(false);
  expect(type.run('false')).toEqual(false);
  expect(type.run('fAlSe')).toEqual(false);

  expect(type.run('f')).toEqual(false);
  expect(type.run('F')).toEqual(false);
});

test('Invalid values', () => {
  expect(() => type.run('invalid')).toThrow();
  expect(() => type.run('value')).toThrow();
});
