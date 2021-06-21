export const ClassMatchRegex = /class (\w*)/;
export const FunctionMatchRegex = /\[Function: (.*)]/;

export function getClassName<T extends { new(...args: Array<any>): Record<any, any> }>(constructor: T): string {
  const classMatch = ClassMatchRegex.exec(constructor.toString());
  const functionMatch = FunctionMatchRegex.exec(constructor.toString());
  return (classMatch && classMatch[1]) || (functionMatch && functionMatch[1]);
}
