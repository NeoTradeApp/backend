const { authService, redisService } = require("@services");

const authMiddleware = async (req, res, next) => {
  try {
    const authToken = req.cookies["auth-token"];
    const userId = authService.verifyToken(authToken);

    const user = await redisService.get(`userId/${userId}`);
    if (!user) {
      throw 401;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({
      name: "Authentication module",
      message: "Failed to authenticate user",
    });
  }
};

module.exports = { authMiddleware };
