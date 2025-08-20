const admin = require("../firebase");

exports.testAuth = async (req, res) => {
  try {
    console.log("Testing Firebase Admin SDK configuration...");

    // Test if Firebase admin is properly initialized
    const auth = admin.auth();
    console.log("Firebase Admin Auth initialized successfully");

    // Test if we can access the project
    const projectId = admin.app().options.projectId;
    console.log("Firebase Project ID:", projectId);

    res.json({
      status: "success",
      message: "Firebase Admin SDK is properly configured",
      projectId: projectId,
    });
  } catch (error) {
    console.error("Firebase Admin SDK test failed:", error);
    res.status(500).json({
      status: "error",
      message: "Firebase Admin SDK configuration error",
      error: error.message,
    });
  }
};

exports.testToken = async (req, res) => {
  try {
    console.log("Testing token verification...");
    console.log("Headers:", req.headers);

    if (!req.headers.authorization) {
      return res.status(400).json({
        status: "error",
        message: "No authorization header provided",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    console.log(
      "Token received (first 50 chars):",
      token ? token.substring(0, 50) + "..." : "null"
    );

    // Try to decode the token without verification first
    const decodedToken = admin.auth().verifyIdToken(token, false);
    console.log("Token decoded successfully:", {
      uid: decodedToken.uid,
      email: decodedToken.email,
      issuer: decodedToken.iss,
      audience: decodedToken.aud,
    });

    res.json({
      status: "success",
      message: "Token verification successful",
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    });
  } catch (error) {
    console.error("Token verification test failed:", error);
    res.status(400).json({
      status: "error",
      message: "Token verification failed",
      error: error.message,
      code: error.code,
    });
  }
};

exports.testServer = (req, res) => {
  res.json({
    status: "success",
    message: "Server is running correctly",
    timestamp: new Date().toISOString(),
  });
};
