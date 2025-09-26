const { asyncHandler } = require("../utils/errorHandler");
const CategoryServiceFactory = require("../factories/categoryServiceFactory");

// Créer le service avec l'implémentation appropriée
const categoryService = CategoryServiceFactory.createCategoryService(
  process.env.DATABASE_TYPE || "mongoose" // "mongoose" ou "mysql"
);

/**
 * Récupérer toutes les catégories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  if (!categories) {
    return res.status(404).json({ message: "No categories found" });
  }
  res.status(200).json(categories);
});

/**
 * Récupérer une catégorie par son slug
 */
exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await categoryService.getCategoryBySlug(slug);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
});

/**
 * Récupérer une catégorie par son ID
 */
exports.getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
});

/**
 * Créer une nouvelle catégorie
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  if (!category) {
    return res.status(400).json({ message: "Failed to create category" });
  }
  res.status(201).json(category);
});

/**
 * Mettre à jour une catégorie
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.updateCategory(id, req.body);
  if (!category) {
    return res.status(400).json({ message: "Failed to update category" });
  }
  res.status(200).json(category);
});

/**
 * Supprimer une catégorie
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.deleteCategory(id);
  if (!category) {
    return res.status(400).json({ message: "Failed to delete category" });
  }
  res.status(204).send();
});
