const { asyncHandler } = require("../utils/errorHandler");
const ProductServiceFactory = require("../factories/productServiceFactory");
const { deleteFromCloudinary } = require("../middleware/cloudinaryUpload");

// Créer le service avec l'implémentation appropriée
const productService = ProductServiceFactory.createProductService(
  process.env.DATABASE_TYPE || "mongoose" // "mongoose" ou "mysql"
);

/**
 * Récupérer tous les produits
 */
exports.getProducts = asyncHandler(async (req, res) => {
  console.log("🔍 getProducts appelé");
  const products = await productService.getProducts();
  console.log("📦 Produits récupérés:", products);
  res.status(200).json(products);
});

/**
 * Récupérer un produit par son slug
 */
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await productService.getProductBySlug(slug);
  res.status(200).json(product);
});

/**
 * Récupérer un produit par son id
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  res.status(200).json(product);
});

/**
 * Créer un produit
 */
exports.createProduct = asyncHandler(async (req, res) => {
  console.log("🔍 Données reçues dans createProduct:");
  console.log("📝 Body:", req.body);
  console.log("📸 Files:", req.files);
  console.log("☁️ Cloudinary Images:", req.cloudinaryImages);

  const productData = {
    ...req.body,
    images: req.cloudinaryImages
      ? req.cloudinaryImages.map((img) => img.url)
      : [],
  };

  console.log("📦 ProductData final:", productData);

  const product = await productService.createProduct(productData);
  res.status(201).json(product);
});

/**
 * Mettre à jour un produit
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("🔍 Données reçues dans updateProduct:");
  console.log("📝 Body:", req.body);
  console.log("📸 Files:", req.files);
  console.log("☁️ Cloudinary Images:", req.cloudinaryImages);

  const productData = {
    ...req.body,
    images: req.cloudinaryImages
      ? req.cloudinaryImages.map((img) => img.url)
      : [],
  };

  console.log("📦 ProductData final pour update:", productData);

  const product = await productService.updateProduct(id, productData);
  res.status(200).json(product);
});

/**
 * Supprimer un produit
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Récupérer le produit avant suppression pour obtenir les images
  const product = await productService.getProductById(id);

  if (product && product.images && product.images.length > 0) {
    // Extraire les public_ids des URLs Cloudinary
    const publicIds = product.images
      .filter((img) => img.includes("cloudinary"))
      .map((img) => {
        const urlParts = img.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        return publicIdWithExtension.split(".")[0]; // Enlever l'extension
      });

    if (publicIds.length > 0) {
      console.log("🗑️ Suppression des images Cloudinary:", publicIds);
      await deleteFromCloudinary(publicIds);
    }
  }

  const deletedProduct = await productService.deleteProduct(id);
  res.status(200).json(deletedProduct);
});
