import { LodashIntegerType } from '../../src/types/LodashInteger';
import { manager } from '../mock';

describe('Regular test', () => {
  const type = new LodashIntegerType(manager(), {});

  test('Valid values', () => {
    expect(type.run('123')).toEqual(+123);
    expect(type.run('+123')).toEqual(+123);
    expect(type.run('-123')).toEqual(-123);

    expect(type.run('123.456e+7')).toEqual(+1234560000);
    expect(type.run('+123.456e+7')).toEqual(+1234560000);
    expect(type.run('-123.456e+7')).toEqual(-1234560000);
  });

  test('Invalid values', () => {
    expect(() => type.run('123a')).toThrow();
    expect(() => type.run('+123a')).toThrow();
    expect(() => type.run('-123a')).toThrow();

    expect(() => type.run('a123')).toThrow();
    expect(() => type.run('a+123')).toThrow();
    expect(() => type.run('a-123')).toThrow();

    expect(() => type.run('a123')).toThrow();
    expect(() => type.run('+a123')).toThrow();
    expect(() => type.run('-a123')).toThrow();

    expect(() => type.run('123.a456')).toThrow();
    expect(() => type.run('+123.a456')).toThrow();
    expect(() => type.run('-123.a456')).toThrow();

    expect(() => type.run('123.456ae7')).toThrow();
    expect(() => type.run('+123.456ae7')).toThrow();
    expect(() => type.run('-123.456ae7')).toThrow();

    expect(() => type.run('123.456ea7')).toThrow();
    expect(() => type.run('+123.456ea7')).toThrow();
    expect(() => type.run('-123.456ea7')).toThrow();
  });
});

describe('Min test', () => {
  const type = new LodashIntegerType(manager(), {
    min: 50,
  });

  test('Valid values', () => {
    expect(type.run('50')).toEqual(50);
    expect(type.run('51')).toEqual(51);
    expect(type.run('60')).toEqual(60);
    expect(type.run('100')).toEqual(100);
    expect(type.run('200')).toEqual(200);

    for (let i = 0; i < 100; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const value = type.options.min! + Math.trunc(Math.random() * 100000);
      expect(type.run(String(value))).toEqual(value);
    }
  });

  test('Invalid values', () => {
    expect(() => type.run('49')).toThrow();
    expect(() => type.run('48')).toThrow();
    expect(() => type.run('40')).toThrow();
    expect(() => type.run('0')).toThrow();
    expect(() => type.run('-50')).toThrow();
  });

  for (let i = 0; i < 100; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = type.options.min! - 1 - Math.trunc(Math.random() * 100000);
    expect(() => type.run(String(value))).toThrow();
  }
});

describe('Max test', () => {
  const type = new LodashIntegerType(manager(), {
    max: 50,
  });

  test('Valid values', () => {
    expect(type.run('50')).toEqual(50);
    expect(type.run('49')).toEqual(49);
    expect(type.run('40')).toEqual(40);
    expect(type.run('0')).toEqual(0);
    expect(type.run('-50')).toEqual(-50);
  });

  for (let i = 0; i < 100; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = type.options.max! - Math.trunc(Math.random() * 100000);
    expect(type.run(String(value))).toEqual(value);
  }

  test('Invalid values', () => {
    expect(() => type.run('51')).toThrow();
    expect(() => type.run('60')).toThrow();
    expect(() => type.run('100')).toThrow();
    expect(() => type.run('200')).toThrow();

    for (let i = 0; i < 100; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const value = type.options.min! + 1 + Math.trunc(Math.random() * 100000);
      expect(() => type.run(String(value))).toThrow();
    }
  });
});
