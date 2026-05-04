const moment = require("moment");

const todayTimeIst = (time) => {
  const now = moment().utcOffset("+05:30");

  if (time) now.startOf("day").set(time);

  return now;
};

const startOfDay = (date) => {
  const now = moment(date).utcOffset("+05:30");
  return now.startOf("day");
};

const endOfDay = (date) => {
  const now = moment(date).utcOffset("+05:30");
  return now.endOf("day");
};

module.exports = {
  todayTimeIst,
  startOfDay,
  endOfDay,
}
