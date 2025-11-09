declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    strictEqual(actual: unknown, expected: unknown, message?: string): void;
    match(actual: string, expected: RegExp, message?: string): void;
    throws(block: () => unknown, expected?: RegExp | ((err: unknown) => boolean) | Error, message?: string): void;
  }

  const assert: Assert;
  export = assert;
}
