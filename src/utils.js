/*
 *  @function createObjectFromArrayOfKeys
 *  @param arrayOfKeys
 *  @param value: any
 *
 *  if value is array it must be the same length as arrayOfKeys
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

/*
 *  @function resultsGenerator
 *  @param pollName: string
 *  @param results: object of results {[emoji.name]: number}
 *
 *  @return result string
 */

export function resultsGenerator(pollName, results) {
  let res = `Задача: ${pollName}\n`;
  let winner = {
    value: 0,
    emojie: null,
  };

  for (let key in results) {
    let emojie = global.client.emojis.cache.get(global.emojieDict[key]);
    const usersStr = results[key].users.join(", ");

    res += `${emojie} - ${results[key].value}       | ${usersStr}\n`;

    if (winner.value < results[key]) {
      winner.value = results[key].value;
      winner.emojie = emojie;
    }
  }
  return res;
}

/*
 *  @function voteGenerator
 *  @param valueStr: string
 *
 *  returns "голос" in different forms depend on value
 */

export function voteGenerator(valueStr) {
  const lastDigit = valueStr.charAt(valueStr.length - 1);
  if (parseInt(valueStr) > 10 && parseInt(valueStr) < 20) return "голосов";
  if (lastDigit.match(/1/)) return "голос";
  if (lastDigit.match(/[2-4]/)) return "голоса";
  return "голосов";
}
