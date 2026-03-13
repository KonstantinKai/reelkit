import { describe, it, expect } from 'vitest';
import { createDeferred } from './deferred';

describe('createDeferred', () => {
  it('should return object with promise and resolve', () => {
    const deferred = createDeferred();

    expect(deferred).toHaveProperty('promise');
    expect(deferred).toHaveProperty('resolve');
    expect(deferred.promise).toBeInstanceOf(Promise);
    expect(typeof deferred.resolve).toBe('function');
  });

  it('should resolve promise when resolve is called', async () => {
    const deferred = createDeferred();
    let resolved = false;

    deferred.promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    deferred.resolve();
    await deferred.promise;
    expect(resolved).toBe(true);
  });

  it('should resolve with correct value', async () => {
    const deferred = createDeferred<number>();

    deferred.resolve(42);
    const result = await deferred.promise;

    expect(result).toBe(42);
  });

  it('should work with void type', async () => {
    const deferred = createDeferred<void>();

    deferred.resolve();
    await expect(deferred.promise).resolves.toBeUndefined();
  });

  it('should work with complex types', async () => {
    interface User {
      name: string;

      age: number;
    }

    const deferred = createDeferred<User>();
    const user: User = { name: 'John', age: 30 };

    deferred.resolve(user);
    const result = await deferred.promise;

    expect(result).toEqual(user);
  });

  it('should allow multiple awaits on the same promise', async () => {
    const deferred = createDeferred<string>();

    deferred.resolve('test');

    const result1 = await deferred.promise;
    const result2 = await deferred.promise;

    expect(result1).toBe('test');
    expect(result2).toBe('test');
  });
});
