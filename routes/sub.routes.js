const express = require("express");
const router = express.Router();

// Controllers
const {
  createSub,
  getSubs,
  getSubBySlug,
  updateSub,
  deleteSub,
} = require("../controllers/sub.controllers");

// Middlewares
const { requireRole } = require("../middleware/auth");

// Endpoints public
router.get("/subs", getSubs);
router.get("/sub/:slug", getSubBySlug);

// Endpoints protected - Admin only
router.post("/sub", requireRole(["admin"]), createSub);
router.put("/sub/:slug", requireRole(["admin"]), updateSub);
router.delete("/sub/:slug", requireRole(["admin"]), deleteSub);

module.exports = router;
