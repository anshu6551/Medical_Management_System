const jwt = require("jsonwebtoken");
const httpStatusCode = require("../utils/httpStatusCode");

const AuthCheck = async (req, res, next) => {
  try {
    let token =
      req?.body?.token ||
      req?.query?.token ||
      req?.headers?.["x-access-token"] ||
      req?.headers?.["authorization"];

    if (!token) {
      return res.status(httpStatusCode.UNAUTHORIZED || 401).json({
        success: false,
        message: "Token is required to access this resource",
      });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user payload to request
    req.user = decoded; 
    
    // Pass control to the next middleware or controller
    next();
  } catch (err) {
    return res.status(httpStatusCode.UNAUTHORIZED || 401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = AuthCheck;