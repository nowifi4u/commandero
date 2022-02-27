import { memoize } from 'lodash';
import { BooleanResolvableType } from '../../src/types/BooleanResolvable';
import { sleep } from '../../src/util/Util';
import { manager } from '../mock';

const truthy: string[] = ['true', 't'];
const falsy: string[] = ['false', 'f'];

async function rawBooleanResolvable (val: string): Promise<boolean> {
  await sleep(1000);
  if (truthy.includes(val)) return true;
  if (falsy.includes(val)) return false;
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw null;
}

const booleanResolve = memoize(rawBooleanResolvable);

const type = new BooleanResolvableType(manager(), {
  resolver: booleanResolve,
});

test('Truthy values', async () => await Promise.all([
  expect(type.run('true', {})).resolves.toEqual(true),
  expect(type.run('TRUE', {})).resolves.toEqual(true),
  expect(type.run('TrUe', {})).resolves.toEqual(true),

  expect(type.run('t', {})).resolves.toEqual(true),
  expect(type.run('T', {})).resolves.toEqual(true),
]));

test('Falsy values', async () => await Promise.all([
  expect(type.run('false', {})).resolves.toEqual(false),
  expect(type.run('false', {})).resolves.toEqual(false),
  expect(type.run('fAlSe', {})).resolves.toEqual(false),

  expect(type.run('f', {})).resolves.toEqual(false),
  expect(type.run('F', {})).resolves.toEqual(false),
]));

test('Invalid values', async () => await Promise.all([
  expect(async () => await type.run('invalid', {})).rejects.toEqual(null),
  expect(async () => await type.run('value', {})).rejects.toEqual(null),
]));
