const jwt = require("jsonwebtoken");

/**
 * Authentication middleware for protecting routes.
 *
 * Steps:
 * 1. Extract the 'Authorization' header from the incoming request.
 * 2. Check if the header exists and starts with "Bearer ". If not, respond with 401 Unauthorized.
 * 3. Extract the JWT token from the header by splitting the string.
 * 4. Verify the token using `jwt.verify` with the secret key from environment variables.
 *    - If valid, attach the decoded token payload to `req.user` for use in later middleware or route handlers.
 *    - Call `next()` to proceed to the next middleware or route handler.
 * 5. If token verification fails (invalid or expired), respond with 403 Forbidden and an error message.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
