const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controllers");

// Middlewares
const { requireRole } = require("../middleware/auth");
const {
  upload,
  uploadToCloudinary,
} = require("../middleware/cloudinaryUpload");

// Endpoints public
router.get("/products", getProducts);
router.get("/product/slug/:slug", getProductBySlug);
router.get("/product/id/:id", getProductById);

// Endpoints protected - Admin only
router.post(
  "/product",
  requireRole(["admin"]),
  upload.array("images", 5),
  uploadToCloudinary,
  createProduct
);
router.put(
  "/product/:id",
  requireRole(["admin"]),
  upload.array("images", 5),
  uploadToCloudinary,
  updateProduct
);
router.delete("/product/:id", requireRole(["admin"]), deleteProduct);

module.exports = router;
