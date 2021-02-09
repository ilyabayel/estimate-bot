/*
 *  createObjectFromArrayOfKeys
 *  @params arrayOfKeys
 *  @param value: any
 *
 *  @returns object
 */
export function createObjectFromArrayOfKeys<T>(arrayOfKeys: string[], value: T): {[key: string]: T} {
  const obj: {[key: string]: T} = {};
  for (let key of arrayOfKeys) {
    obj[key] = JSON.parse(JSON.stringify(value));
  }
  return obj;
}

/*
 *  @function createObjectFromTwoArrays<T>
 *  @param keys: string[]
 *  @param value: T[]
 *
 *  @description both arrays must be same length
 */
export function createObjectFromTwoArrays<T>(keys: string[], values: T[]): {[key: string]: T} {
  if (keys.length !== values.length) throw new Error("keys and values must be same length")
  const obj: {[key: string]: T} = {};
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i];
  }
  return obj;
}
