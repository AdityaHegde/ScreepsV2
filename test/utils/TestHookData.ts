export interface TestParams {
  propertyKey: string,
  dataProvider: string,
}

export class TestHookData {
  public before = new Array<string>();
  public beforeEach = new Array<string>();
  public tests = new Array<TestParams>();
  public after = new Array<string>();
  public afterEach = new Array<string>();

  public constructor(copyFrom?: TestHookData) {
    if (copyFrom) {
      this.before = [...copyFrom.before];
      this.beforeEach = [...copyFrom.beforeEach];
      this.tests = [...copyFrom.tests];
      this.after = [...copyFrom.after];
      this.afterEach = [...copyFrom.afterEach];
    }
  }
}