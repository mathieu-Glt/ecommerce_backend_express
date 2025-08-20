const express = require("express");
const router = express.Router();
const {
  userController,
  createOrUpdateUser,
  registerOrUpdateUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  currentUser,
} = require("../controllers/user.controllers");

// Middlewares
const { checkAuth } = require("../middlewares/auth");

const myMiddleware = (req, res, next) => {
  console.log("My Middleware is running");
  next();
};

// Routes
router.get("/", userController);
router.post("/create-or-update-user", checkAuth, createOrUpdateUser);
router.post("/register-user", registerOrUpdateUser);
router.get("/current-user", checkAuth, currentUser);

// ✅ Nouvelles routes utilisant les nouvelles méthodes
router.get("/profile/:email", getUserProfile);
router.put("/profile/:email", checkAuth, updateUserProfile);
router.delete("/:email", checkAuth, deleteUser);

router.get("/testing", myMiddleware, (req, res) => {
  res.json({ status: "success", message: "Testing Route" });
});

module.exports = router;
