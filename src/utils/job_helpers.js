const generateRandomId = (length = 10) => {
  const chars = 'ABCDEF0123456789';
  let jobId = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    jobId += chars[randomIndex];
  }

  return jobId;
}

const parseTimeToSeconds = (timeInStr) => {
  const multiplier = {
    "s": 1,
    "m": 60,
    "h": 3600,
    "d": 86400,
    "w": 604800,
  };
  const sum = (arr) => arr.reduce((s, n) => s + n, 0);

  const unitsWithValue = Array.from(timeInStr.matchAll(/(\d+)([A-Za-z])/g)) || [];

  const timeInSeconds = unitsWithValue.map((unitWithValue) => {
    const [, value, unit] = unitWithValue;
    return value && unit ? (parseFloat(value) * (multiplier[unit] || 1)) : 0;
  });

  return sum(timeInSeconds);
};

module.exports = { generateRandomId, parseTimeToSeconds };
