import { camelCase } from 'camel-case';
import { types } from 'util';

export function deepObjectToCamelCase(
  object: Record<string, unknown>,
  replacer = /^\s+|\s+$/g,
): Record<string, unknown> {
  if (
    !object ||
    typeof object !== 'object' ||
    Array.isArray(object) ||
    Buffer.isBuffer(object) ||
    types.isDate(object) ||
    types.isRegExp(object) ||
    types.isStringObject(object) ||
    !Object.keys(object).length
  )
    return object;
  return Object.entries(object).reduce((result, [key, value]) => {
    result[camelCase(key.replace(replacer, ''))] = deepObjectToCamelCase(
      value as Record<string, unknown>,
      replacer,
    );
    return result;
  }, {} as Record<string, unknown>);
}
