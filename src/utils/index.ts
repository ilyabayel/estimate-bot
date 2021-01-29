/*
 *  createObjectFromArrayOfKeys
 *  @params arrayOfKeys
 *  @param value: any
 *
 *  @returns object
 */
export function createObjectFromArrayOfKeys<v>(arrayOfKeys: string[], value: v): {[key: string]: v} {
  const obj = {};
  for (let key of arrayOfKeys) {
    obj[key] = JSON.parse(JSON.stringify(value));
  }
  return obj;
}

/*
 *  @function createObjectFromTwoArrays
 *  @param keys: string[]
 *  @param value: any[]
 *
 *  @description both arrays must be same length
 */
export function createObjectFromTwoArrays(keys: string[], values: any[]): {[key: string]: any} {
  if (keys.length !== values.length) throw new Error("keys and values must be same length")
  const obj = {};
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i] ?? 0;
  }
  return obj;
}
