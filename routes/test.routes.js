const express = require("express");
const router = express.Router();
const {
  testAuth,
  testToken,
  testServer,
} = require("../controllers/test.controllers");

// Routes
router.get("/", testServer);

// Test Firebase Admin SDK configuration
router.get("/firebase-config", testAuth);

// Test token verification
router.post("/test-token", testToken);

module.exports = router;
