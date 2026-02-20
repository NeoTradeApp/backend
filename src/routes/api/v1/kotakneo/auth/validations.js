const { ApplicationError } = require("@error_handlers");

const validateLoginParams = ({ mobileNumber, password }) => {
  if (!mobileNumber || !password) {
    throw new ApplicationError(
      "Missing parameters mobile number or password",
      400
    );
  }

  const match = mobileNumber.match(/^\+[0-9]{2}[0-9]{10}$/);
  if (!match) {
    throw new ApplicationError("Invalid mobile number", 400);
  }

  return true;
};

module.exports = {
  validateLoginParams,
};
