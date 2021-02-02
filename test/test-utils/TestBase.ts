import "mocha";
import sinon from "sinon";

function getClassName(clazz) {
  const classNameMatch = clazz.toString().match(/class (\w*) .*/);
  return classNameMatch && classNameMatch[1];
}

type TestData = {
  propertyKey: string,
  dataProvider: string,
};
type DataProviderData = {
  title?: string;
  args?: Array<any>;
  subData?: Array<DataProviderData>;
};

export class TestBase {
  private _title: string;
  private _before: Array<string>;
  private _beforeEach: Array<string>;
  private _tests: Array<TestData>;
  private _after: Array<string>;
  private _afterEach: Array<string>;

  protected sandbox: sinon.SinonSandbox;

  public static Suite(constructor: typeof TestBase) {
    const instance = new constructor();
    instance._title = getClassName(constructor);
    instance._test();
  }

  public static BeforeSuite() {
    return (target: TestBase, propertyKey: string) => {
      if (!target._before) {
        target._before = [];
      }

      target._before.push(propertyKey);
    };
  }

  public static BeforeEachTest() {
    return (target: TestBase, propertyKey: string) => {
      if (!target._beforeEach) {
        target._beforeEach = [];
      }

      target._beforeEach.push(propertyKey);
    };
  }

  public static AfterSuite() {
    return (target: TestBase, propertyKey: string) => {
      if (!target._after) {
        target._after = [];
      }

      target._after.push(propertyKey);
    };
  }

  public static AfterEachTest() {
    return (target: TestBase, propertyKey: string) => {
      if (!target._afterEach) {
        target._afterEach = [];
      }

      target._afterEach.push(propertyKey);
    };
  }

  public static Test(dataProvider?: string) {
    return (target: TestBase, propertyKey: string) => {
      if (!target._tests) {
        target._tests = [];
      }

      target._tests.push({
        propertyKey,
        dataProvider,
      });
    };
  }

  protected declareSuite(suiteTitle: string, suiteCallback: () => void) {
    describe(suiteTitle, () => {
      suiteCallback();
    });
  }

  protected declareBefore(beforeCallback: () => Promise<void>) {
    before(async () => {
      await beforeCallback();
    });
  }

  protected declareBeforeEach(beforeEachCallback: () => Promise<void>) {
    beforeEach(async () => {
      await beforeEachCallback();
    });
  }

  protected declareTest(testTitle: string, testCallback: () => Promise<void>) {
    it(testTitle, async () => {
      await testCallback();
    });
  }

  protected declareAfterEach(afterEachCallback: () => Promise<void>) {
    afterEach(async () => {
      await afterEachCallback();
    });
  }

  protected declareAfter(afterCallback: () => Promise<void>) {
    after(async () => {
      await afterCallback();
    });
  }

  private _test() {
    this.declareSuite(this._title, () => {
      this.declareBefore(async () => {
        await this._beforeWrapper();
      });

      this.declareBeforeEach(async () => {
        await this._beforeEachWrapper();
      });

      this._tests.forEach((testData: TestData) => {
        this.registerTest(testData);
      });

      this.declareAfterEach(async () => {
        await this._afterEachWrapper();
      });

      this.declareAfter(async () => {
        await this._afterWrapper();
      });
    });
  }

  private async _beforeWrapper() {
    this.sandbox = sinon.createSandbox();

    if (this._before) {
      for (const beforeFunction of this._before) {
        await this[beforeFunction]();
      }
    }
  }

  private async _beforeEachWrapper() {
    this.sandbox.reset();

    if (this._beforeEach) {
      for (const beforeEachFunction of this._beforeEach) {
        await this[beforeEachFunction]();
      }
    }
  }

  private registerTest(testData: TestData) {
    if (testData.dataProvider) {
      const data: DataProviderData = this[testData.dataProvider]();
      this.registerDataProvider(data, testData);
    } else {
      this.declareTest(testData.propertyKey, async () => {
        await this[testData.propertyKey]();
      });
    }
  }

  private registerDataProvider(data: DataProviderData, testData: TestData) {
    if (data.args) {
      this.declareTest(data.title || data.args.map(arg => arg.toString()).join(","),
        async () => {
          await this[testData.propertyKey](...data.args);
        });
    } else if (data.subData) {
      this.declareSuite(data.title || testData.propertyKey, () => {
        data.subData.forEach((_data) => {
          this.registerDataProvider(_data, testData);
        });
      });
    }
  }

  private async _afterEachWrapper() {
    if (this._afterEach) {
      for (const afterEachFunction of this._afterEach) {
        await this[afterEachFunction]();
      }
    }
  }

  private async _afterWrapper() {
    if (this._after) {
      for (const afterFunction of this._after) {
        await this[afterFunction]();
      }
    }

    this.sandbox.restore();
  }
}
