const fs = require("fs");
const path = require("path");

/**
 * Sauvegarde une image Base64 dans le système de fichiers
 * @param {string} base64Image - L'image en format Base64
 * @param {string} folder - Le dossier de destination (ex: 'avatars', 'products')
 * @param {string} filename - Le nom du fichier (sans extension)
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
const saveBase64Image = async (
  base64Image,
  folder = "avatars",
  filename = null
) => {
  try {
    // Vérifier si l'image est en Base64
    if (!base64Image.startsWith("data:image/")) {
      return {
        success: false,
        error: "Invalid image format. Expected Base64 image.",
      };
    }

    // Extraire le type MIME et les données
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return {
        success: false,
        error: "Invalid Base64 image format",
      };
    }

    const mimeType = matches[1];
    const imageData = matches[2];

    // Vérifier le type MIME
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(mimeType)) {
      return {
        success: false,
        error: "Unsupported image type. Allowed: JPEG, PNG, GIF, WebP",
      };
    }

    // Créer le dossier s'il n'existe pas
    const uploadDir = path.join(__dirname, "..", "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const extension = mimeType.split("/")[1];
    const uniqueFilename = filename
      ? `${filename}-${Date.now()}.${extension}`
      : `image-${Date.now()}.${extension}`;

    const filePath = path.join(uploadDir, uniqueFilename);

    // Sauvegarder l'image
    fs.writeFileSync(filePath, imageData, "base64");

    // Retourner le chemin relatif pour l'URL
    const relativePath = `/uploads/${folder}/${uniqueFilename}`;

    return {
      success: true,
      path: relativePath,
    };
  } catch (error) {
    console.error("Error saving image:", error);
    return {
      success: false,
      error: "Failed to save image",
    };
  }
};

/**
 * Supprime une image du système de fichiers
 * @param {string} imagePath - Le chemin de l'image à supprimer
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) {
      return { success: true }; // Pas d'image à supprimer
    }

    const fullPath = path.join(__dirname, "..", "public", imagePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error: "Failed to delete image",
    };
  }
};

/**
 * Valide une image Base64
 * @param {string} base64Image - L'image en format Base64
 * @param {number} maxSizeMB - Taille maximale en MB (défaut: 5MB)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const validateBase64Image = async (base64Image, maxSizeMB = 5) => {
  try {
    // Vérifier si l'image est en Base64
    if (!base64Image.startsWith("data:image/")) {
      return {
        success: false,
        error: "Invalid image format. Expected Base64 image.",
      };
    }

    // Extraire les données
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return {
        success: false,
        error: "Invalid Base64 image format",
      };
    }

    const mimeType = matches[1];
    const imageData = matches[2];

    // Vérifier le type MIME
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(mimeType)) {
      return {
        success: false,
        error: "Unsupported image type. Allowed: JPEG, PNG, GIF, WebP",
      };
    }

    // Vérifier la taille
    const sizeInBytes = Buffer.byteLength(imageData, "base64");
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > maxSizeMB) {
      return {
        success: false,
        error: `Image size too large. Maximum allowed: ${maxSizeMB}MB`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to validate image",
    };
  }
};

module.exports = {
  saveBase64Image,
  deleteImage,
  validateBase64Image,
};
