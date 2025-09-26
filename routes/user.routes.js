const express = require("express");
const router = express.Router();

// Controllers
const {
  getUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controllers");
const { requireRole } = require("../middleware/auth");

// Middlewares

// Routes
router.get("/users", requireRole(["admin"]), getUsers);
router.get("/user/:email", getUserByEmail);
router.get("/users/:id", getUserById);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

module.exports = router;
