/*
 *  createObjectFromArrayOfKeys
 *  @params arrayOfKeys
 *  @param value: any
 *
 *  @returns object
 */
export function createObjectFromArrayOfKeys(arrayOfKeys, value) {
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
export function createObjectFromTwoArrays(keys, values) {
  const obj = {};
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i] ?? 0;
  }
  return obj;
}
