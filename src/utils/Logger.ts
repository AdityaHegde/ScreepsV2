export class Logger {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  log(...messages) {
    console.log(`[${this.label}]`, ...messages);
  }

  logJSON(json) {
    console.log(JSON.stringify(json));
  }
}

export function Log<T extends { new(...args: Array<any>): {} }>(constructor: T) {
  const classMatch = constructor.toString().match(/class (\w*)/);
  const functionMatch = constructor.toString().match(/\[Function: (.*)\]/);
  const label: string = (classMatch && classMatch[1]) || (functionMatch && functionMatch[1]);
  return class extends constructor {
    public logger: Logger = new Logger(label);
  };
}
