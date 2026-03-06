const { ApplicationError } = require("@error_handlers");

const validateLoginParams = ({ mobileNumber, ucc, totp }) => {
  if (!mobileNumber || !ucc || !totp) {
    throw new ApplicationError(
      "Missing parameters mobile number, unique client code or TOTP",
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
