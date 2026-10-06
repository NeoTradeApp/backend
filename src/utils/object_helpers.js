// const selectKeys = (obj, ...keys) =>
//   obj && keys.reduce((result, key) => ({ ...result, [key]: obj[key] }), {});

const selectKeys = (obj, ...keys) =>
  obj && keys.reduce((result, key) => {
    const [originalKey, alias] = (key.split("as") || []).map(k => k.trim());

    return ({ ...result, [alias || originalKey]: obj[originalKey] })
  }, {});

const getErrorMessage = (errorObj, ...keys) => {
  const keysToMatch = ["message"].concat(keys);

  const regexToMatch = new RegExp(`"(${keysToMatch.join("|")})":\s*"([^"]*)"`, "g");
  const stringifiedError = JSON.stringify(errorObj);

  const matches = Array.from(stringifiedError.matchAll(regexToMatch));

  return matches.map(([, , match]) => match).join(". ");
};

module.exports = { selectKeys, getErrorMessage };
