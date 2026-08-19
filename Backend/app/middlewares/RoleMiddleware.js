const httpStatusCode = require("../utils/httpStatusCode");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req?.user || !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatusCode.FORBIDDEN).json({
          success: false,
          message: `Access Denied: You are not authorized for this operation. Required role: [${allowedRoles.join(", ")}]`,
        });
      }

      next();
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Role authorization failed",
      });
    }
  };
};

module.exports = authorizeRoles;