import { LodashNumberType } from '../../src/types/LodashNumber';
import { manager } from '../mock';

const type = new LodashNumberType(manager(), {});

test('Valid values', async () => await Promise.all([
  expect(type.run('+123.456')).toEqual(+123.456),
  expect(type.run('-123.456')).toEqual(-123.456),
  expect(type.run('+123.456e+7')).toEqual(+123.456e+7),
  expect(type.run('-123.456e-7')).toEqual(-123.456e-7),
]));

test('Invalid values', async () => await Promise.all([
  expect(() => type.run('+123a')).toThrow(),
  expect(() => type.run('a+123')).toThrow(),
]));
