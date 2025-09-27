const AuthService = require("../services/authService");
const UserServiceFactory = require("../factories/userServiceFactory");
const admin = require("firebase-admin");

// Create an instance of the authentication service
const userService = UserServiceFactory.createUserService(
  process.env.DATABASE_TYPE || "mongoose"
);
const authService = new AuthService(userService.userRepository);

/**
 * Retrieve the token from the Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers["authorization"];
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
};

/**
 * Middleware to verify authentication using JWT or session
 */
const authenticateToken = async (req, res, next) => {
  console.log("authenticateToken", req.headers);
  console.log("Session data:", req.session);
  try {
    const token = extractToken(req);

    if (!token && !req.session?.user) {
      return res.status(401).json({ success: false, error: "Token requis" });
    }

    // Give priority to JWT if present
    let user;
    if (token) {
      const tokenResult = authService.verifyToken(token);
      if (!tokenResult.success) {
        return res
          .status(403)
          .json({ success: false, error: tokenResult.error });
      }
      user = tokenResult.user;
    } else if (req.session.user) {
      user = req.session.user;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur authenticateToken:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

/**
 * Middleware optionnel : ne bloque pas si pas authentifié
 */
// const optionalAuth = async (req, res, next) => {
//   try {
//     const token = extractToken(req);
//     if (token) {
//       const tokenResult = authService.verifyToken(token);
//       if (tokenResult.success) req.user = tokenResult.user;
//     } else if (req.session?.user) {
//       req.user = req.session.user;
//     }
//     next();
//   } catch (error) {
//     console.error("Erreur optionalAuth:", error);
//     next();
//   }
// };

/**
 * Middleware for role verification
 * @param {Array<string>} roles - ex : ["admin", "moderator"]
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, error: "Authentification requise" });
  }
  const userRole = req.user.role || "user";
  if (!roles.includes(userRole)) {
    return res
      .status(403)
      .json({ success: false, error: "Permissions insuffisantes" });
  }
  next();
};

/**
 * Check the Firebase token if necessary
 */
const checkAuthFirebase = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const firebaseUser = await admin.auth().verifyIdToken(token);
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(firebaseUser.uid)
      .get();

    req.user = userDoc.data();
    next();
  } catch (error) {
    console.error("Erreur checkAuthFirebase:", error);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or Expired Token" });
  }
};

module.exports = {
  authenticateToken,
  // optionalAuth,
  requireRole,
  checkAuthFirebase,
};
