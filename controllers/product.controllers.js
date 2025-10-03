/**
 * Product Controller
 *
 * Handles all product-related operations:
 * - Retrieve all products
 * - Retrieve a product by ID or slug
 * - Create new products (with image upload via Cloudinary)
 * - Update existing products
 * - Delete products (and remove associated Cloudinary images)
 *
 * @module controllers/product.controller
 */

const { asyncHandler } = require("../utils/errorHandler");
const ProductServiceFactory = require("../factories/productServiceFactory");
const { deleteFromCloudinary } = require("../middleware/cloudinaryUpload");

// Create product service based on database type (mongoose or mysql)
const productService = ProductServiceFactory.createProductService(
  process.env.DATABASE_TYPE || "mongoose"
);

/**
 * Get all products
 *
 * @route GET /products
 * @access Public
 * @returns {Array} 200 - List of all products
 * @returns {Object} 404 - No products found
 */
exports.getProducts = asyncHandler(async (req, res) => {
  console.log("🔍 getProducts called");
  const products = await productService.getProducts();
  console.log("📦 Products retrieved:", products);
  if (!products) {
    return res.status(404).json({ message: "No products found" });
  }
  res.status(200).json(products);
});

/**
 * Get a product by slug
 *
 * @route GET /products/slug/:slug
 * @access Public
 * @param {string} slug - Product slug
 * @returns {Object} 200 - Product details
 * @returns {Object} 404 - Product not found
 */
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await productService.getProductBySlug(slug);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

/**
 * Get a product by ID
 *
 * @route GET /products/:id
 * @access Public
 * @param {string} id - Product ID
 * @returns {Object} 200 - Product details
 * @returns {Object} 404 - Product not found
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

/**
 * Create a new product
 *
 * @route POST /products
 * @access Admin
 * @param {Object} body - Product data
 * @param {Array} [files] - Uploaded product images
 * @param {Array} [cloudinaryImages] - Images uploaded to Cloudinary
 * @returns {Object} 201 - Created product
 * @returns {Object} 400 - Validation errors
 */
exports.createProduct = asyncHandler(async (req, res) => {
  console.log("Data received in createProduct:");
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  console.log("Cloudinary Images:", req.cloudinaryImages);

  const productData = {
    ...req.body,
    images: req.cloudinaryImages
      ? req.cloudinaryImages.map((img) => img.url) // Extract object img of the request array to get only the url property
      : [],
  };

  console.log("📦 Final ProductData:", productData);

  const product = await productService.createProduct(productData);
  res.status(201).json(product);
});

/**
 * Update an existing product
 *
 * @route PUT /products/:id
 * @access Admin
 * @param {string} id - Product ID
 * @param {Object} body - Updated product data
 * @param {Array} [files] - Uploaded product images
 * @param {Array} [cloudinaryImages] - Updated images uploaded to Cloudinary
 * @returns {Object} 200 - Updated product
 * @returns {Object} 404 - Product not found
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("🔍 Data received in updateProduct:");
  console.log("📝 Body:", req.body);
  console.log("📸 Files:", req.files);
  console.log("☁️ Cloudinary Images:", req.cloudinaryImages);

  const productData = {
    ...req.body,
    images: req.cloudinaryImages
      ? req.cloudinaryImages.map((img) => img.url)
      : [],
  };

  console.log("📦 Final ProductData for update:", productData);

  const product = await productService.updateProduct(id, productData);
  res.status(200).json(product);
});

/**
 * Delete a product
 *
 * @route DELETE /products/:id
 * @access Admin
 * @param {string} id - Product ID
 * @returns {Object} 200 - Deleted product
 * @returns {Object} 404 - Product not found
 *
 * Additionally:
 * - If the product has images stored in Cloudinary,
 *   those images are deleted before removing the product from the database.
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Retrieve product before deletion to fetch associated images
  const product = await productService.getProductById(id);

  if (product && product.images && product.images.length > 0) {
    // Extract Cloudinary public IDs from image URLs
    const publicIds = product.images
      .filter((img) => img.includes("cloudinary"))
      .map((img) => {
        const urlParts = img.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        return publicIdWithExtension.split(".")[0]; // Remove file extension
      });

    if (publicIds.length > 0) {
      console.log("🗑️ Deleting Cloudinary images:", publicIds);
      await deleteFromCloudinary(publicIds);
    }
  }

  const deletedProduct = await productService.deleteProduct(id);
  res.status(200).json(deletedProduct);
});
