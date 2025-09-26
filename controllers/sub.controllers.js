const { asyncHandler } = require("../utils/errorHandler");
const SubServiceFactory = require("../factories/subServiceFactory");

// Créer le service avec l'implémentation appropriée
const subService = SubServiceFactory.createSubService(
  process.env.DATABASE_TYPE || "mongoose" // "mongoose" ou "mysql"
);

/**
 * Récupérer toutes les sous-catégories
 */
exports.getSubs = asyncHandler(async (req, res) => {
  console.log("🔍 getSubs appelé par:", req.user?.email);
  try {
    const subs = await subService.getSubs();
    console.log("📊 Sous-catégories trouvées:", subs?.length || 0);
    if (!subs) {
      console.log("❌ Aucune sous-catégorie trouvée");
      return res.status(404).json({ message: "No sub-categories found" });
    }
    console.log("✅ Envoi des sous-catégories:", subs);
    res.status(200).json(subs);
  } catch (error) {
    console.error("❌ Erreur dans getSubs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Récupérer une sous-catégorie par son slug
 */
exports.getSubBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const sub = await subService.getSubBySlug(slug);
  if (!sub) {
    return res.status(404).json({ message: "Sub not found" });
  }
  res.status(200).json(sub);
});

/**
 * Créer une nouvelle sous-catégorie
 */
exports.createSub = asyncHandler(async (req, res) => {
  try {
    const sub = await subService.createSub(req.body);
    if (!sub) {
      return res.status(400).json({ message: "Failed to create sub" });
    }
    res.status(201).json(sub);
  } catch (error) {
    console.error("❌ Erreur création sous-catégorie:", error.message);
    res.status(400).json({ 
      status: "error", 
      message: error.message || "Failed to create sub-category" 
    });
  }
});

/**
 * Mettre à jour une sous-catégorie
 */
exports.updateSub = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const sub = await subService.updateSub(slug, req.body);
    if (!sub) {
      return res.status(400).json({ message: "Failed to update sub" });
    }
    res.status(200).json(sub);
  } catch (error) {
    console.error("❌ Erreur mise à jour sous-catégorie:", error.message);
    res.status(400).json({ 
      status: "error", 
      message: error.message || "Failed to update sub-category" 
    });
  }
});

/**
 * Supprimer une sous-catégorie
 */
exports.deleteSub = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const sub = await subService.deleteSub(slug);
  if (!sub) {
    return res.status(400).json({ message: "Failed to delete sub" });
  }
  res.status(204).send();
});
