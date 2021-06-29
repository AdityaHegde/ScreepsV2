import {TestHookData, TestParams} from "./TestHookData";
import {getClassName} from "../../src/utils/getClassName";
import sinon from "sinon";

export interface DataProviderData<Type = any> {
  title?: string;
  args?: Type;
  subData?: Array<DataProviderData<Type>>;
}

/**
 */
export class TestBase {
  protected static testHookData = new TestHookData();

  protected sandbox: sinon.SinonSandbox;

  private testsStarted = false;
  protected readonly suiteTitle: string;

  public constructor(suiteTitle: string) {
    this.suiteTitle = suiteTitle;
  }

  /**
   * Automatically adds the tests for the class. Useful when the test class is standalone.
   */
  public static Suite(constructor: typeof TestBase) {
    constructor.StaticSuite(constructor);

    const instance = new constructor(getClassName(constructor));
    instance._test();
  }

  /**
   * Have to be explicitly instantiated and tests have to be started.
   * Useful when the test class is parameterised and multiple instances can exist.
   */
  public static StaticSuite(constructor: typeof TestBase) {
    if (!constructor.testHookData) {
      constructor.testHookData = new TestHookData();
    }
  }

  /**
   */
  public static BeforeSuite() {
    return (target: TestBase, propertyKey: string) => {
      const constructor = TestBase.createTestHookData(target);
      constructor.testHookData.before.push(propertyKey);
    };
  }

  /**
   */
  public static BeforeEachTest() {
    return (target: TestBase, propertyKey: string) => {
      const constructor = TestBase.createTestHookData(target);
      constructor.testHookData.beforeEach.push(propertyKey);
    };
  }

  /**
   */
  public static AfterSuite() {
    return (target: TestBase, propertyKey: string) => {
      const constructor = TestBase.createTestHookData(target);
      constructor.testHookData.after.push(propertyKey);
    };
  }

  /**
   */
  public static AfterEachTest() {
    return (target: TestBase, propertyKey: string) => {
      const constructor = TestBase.createTestHookData(target);
      constructor.testHookData.afterEach.push(propertyKey);
    };
  }

  /**
   */
  public static Test(dataProvider?: string) {
    return (target: TestBase, propertyKey: string) => {
      const constructor = TestBase.createTestHookData(target);
      constructor.testHookData.tests.push({
        propertyKey,
        dataProvider,
      });
    };
  }

  public test(): void {
    if (this.testsStarted) {
      return;
    }
    this.testsStarted = true;
    this._test();
  }

  /**
   */
  protected declareSuite(suiteTitle: string, suiteCallback: () => void): void {
    describe(suiteTitle, () => {
      suiteCallback();
    });
  }

  /**
   */
  protected declareBefore(beforeCallback: () => Promise<void>): void {
    before(async () => {
      await beforeCallback();
    });
  }

  /**
   */
  protected declareBeforeEach(beforeEachCallback: () => Promise<void>): void {
    beforeEach(async () => {
      await beforeEachCallback();
    });
  }

  /**
   */
  protected declareTest(testTitle: string, testCallback: () => Promise<void>): void {
    it(testTitle, async () => {
      await testCallback();
    });
  }

  /**
   */
  protected declareAfterEach(afterEachCallback: () => Promise<void>): void {
    afterEach(async () => {
      await afterEachCallback();
    });
  }

  /**
   */
  protected declareAfter(afterCallback: () => Promise<void>): void {
    after(async () => {
      await afterCallback();
    });
  }

  /**
   * @internal
   */
  private _test() {
    const testHookData = (this.constructor as typeof TestBase).testHookData;
    this.declareSuite(this.suiteTitle, () => {
      this.declareBefore(async () => {
        await this._beforeWrapper();
      });

      this.declareBeforeEach(async () => {
        await this._beforeEachWrapper();
      });

      testHookData.tests.forEach((testParams: TestParams) => {
        this.registerTest(testParams);
      });

      this.declareAfterEach(async () => {
        await this._afterEachWrapper();
      });

      this.declareAfter(async () => {
        await this._afterWrapper();
      });
    });
  }

  /**
   * @internal
   */
  private async _beforeWrapper() {
    this.sandbox = sinon.createSandbox();

    const testHookData = (this.constructor as typeof TestBase).testHookData;
    for (const beforeFunction of testHookData.before) {
      await this[beforeFunction]();
    }
  }

  /**
   * @internal
   */
  private async _beforeEachWrapper() {
    this.sandbox.reset();

    const testHookData = (this.constructor as typeof TestBase).testHookData;
    for (const beforeEachFunction of testHookData.beforeEach) {
      await this[beforeEachFunction]();
    }
  }

  /**
   * @internal
   */
  private registerTest(testParams: TestParams) {
    if (testParams.dataProvider) {
      this.registerDataProvider(this[testParams.dataProvider](), testParams);
    } else {
      this.declareTest(testParams.propertyKey, async () => {
        await this[testParams.propertyKey]();
      });
    }
  }

  /**
   * @internal
   */
  private registerDataProvider(data: DataProviderData, testParams: TestParams) {
    if (data.args) {
      this.declareTest(data.title || `Data(${data.args.map(arg => arg.toString()).join(",")})`,
        async () => {
          await this[testParams.propertyKey](...data.args);
        });
    } else if (data.subData) {
      this.declareSuite(data.title || testParams.propertyKey, () => {
        data.subData.forEach((_data) => {
          this.registerDataProvider(_data, testParams);
        });
      });
    }
  }

  /**
   * @internal
   */
  private async _afterEachWrapper() {
    const testHookData = (this.constructor as typeof TestBase).testHookData;
    for (let i = testHookData.afterEach.length - 1; i >= 0; i--) {
      await this[testHookData.afterEach[i]]();
    }
  }

  /**
   * @internal
   */
  private async _afterWrapper() {
    const testHookData = (this.constructor as typeof TestBase).testHookData;
    for (let i = testHookData.after.length - 1; i >= 0; i--) {
      await this[testHookData.after[i]]();
    }

    this.sandbox.restore();
  }

  /**
   * @internal
   */
  private static createTestHookData(target: TestBase): typeof TestBase {
    const constructor = target.constructor as typeof TestBase;

    if (!Object.prototype.hasOwnProperty.call(constructor, "_testHookData")) {
      constructor.testHookData = new TestHookData(constructor.testHookData);
    }

    return constructor;
  }
}
