const multer = require("multer");
const { uploadImage, deleteImage } = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

// Configuration multer pour stockage temporaire
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/temp");
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"), false);
    }
  },
});

// Middleware pour upload vers Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Vérifier si Cloudinary est configuré
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!isCloudinaryConfigured) {
      console.log("⚠️ Cloudinary non configuré, utilisation du stockage local");

      // Utiliser le stockage local comme fallback
      const uploadedImages = [];

      for (const file of req.files) {
        // Déplacer le fichier vers le dossier uploads permanent
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        fs.copyFileSync(file.path, filePath);
        fs.unlinkSync(file.path); // Supprimer le fichier temporaire

        uploadedImages.push({
          originalName: file.originalname,
          url: `/uploads/${fileName}`,
          local: true,
        });

        console.log("✅ Image sauvegardée localement:", filePath);
      }

      req.cloudinaryImages = uploadedImages;
      return next();
    }

    const uploadedImages = [];

    for (const file of req.files) {
      console.log("📤 Upload vers Cloudinary:", file.originalname);

      const result = await uploadImage(file.path);

      if (result.success) {
        uploadedImages.push({
          originalName: file.originalname,
          public_id: result.public_id,
          url: result.url,
          width: result.width,
          height: result.height,
        });
        console.log("✅ Image uploadée:", result.url);
      } else {
        console.error("❌ Erreur upload:", result.error);
        throw new Error(`Erreur upload ${file.originalname}: ${result.error}`);
      }

      // Supprimer le fichier temporaire
      fs.unlinkSync(file.path);
    }

    req.cloudinaryImages = uploadedImages;
    next();
  } catch (error) {
    console.error("❌ Erreur middleware Cloudinary:", error);

    // Nettoyer les fichiers temporaires en cas d'erreur
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload des images",
      error: error.message,
    });
  }
};

// Middleware pour supprimer des images de Cloudinary
const deleteFromCloudinary = async (publicIds) => {
  try {
    const results = [];

    for (const publicId of publicIds) {
      console.log("🗑️ Suppression de Cloudinary:", publicId);
      const result = await deleteImage(publicId);
      results.push({ publicId, ...result });
    }

    return results;
  } catch (error) {
    console.error("❌ Erreur suppression Cloudinary:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
