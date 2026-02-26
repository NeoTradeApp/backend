const selectKeys = (obj, ...keys) =>
  obj && keys.reduce((result, key) => ({ ...result, [key]: obj[key] }), {});

const getErrorMessage = (errorObj, ...keys) => {
  const keysToMatch = ["message"].concat(keys);

  const regexToMatch = new RegExp(`"(${keysToMatch.join("|")})":\s*"([^"]*)"`, "g");
  const stringifiedError = JSON.stringify(errorObj);

  const matches = Array.from(stringifiedError.matchAll(regexToMatch));

  return matches.map(([, , match]) => match).join(". ");
};

module.exports = { selectKeys, getErrorMessage };
