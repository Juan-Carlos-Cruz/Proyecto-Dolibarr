declare module 'node:test' {
  interface TestContext {
    test: TestFunction;
  }

  interface TestFunction {
    (name: string, fn: (t: TestContext) => Promise<void> | void): Promise<void> | void;
    (fn: (t: TestContext) => Promise<void> | void): Promise<void> | void;
    test: TestFunction;
  }

  const test: TestFunction;
  export = test;
}
