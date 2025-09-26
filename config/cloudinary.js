const cloudinary = require("cloudinary").v2;

// Configuration
console.log("🔧 Configuration Cloudinary:");
console.log(
  "  - CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✅ Défini" : "❌ Manquant"
);
console.log(
  "  - CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "✅ Défini" : "❌ Manquant"
);
console.log(
  "  - CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Défini" : "❌ Manquant"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource_type: "auto",
      folder: "ecommerce",
      ...options,
    });

    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Erreur upload Cloudinary:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete an image
const deleteImage = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return {
      success: true,
      message: `Image with public_id ${public_id} deleted successfully`,
    };
  } catch (error) {
    console.error("Erreur suppression Cloudinary:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate optimized URL
const getOptimizedUrl = (public_id, options = {}) => {
  return cloudinary.url(public_id, {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
};

// Generate thumbnail URL
const getThumbnailUrl = (public_id, width = 300, height = 300) => {
  return cloudinary.url(public_id, {
    crop: "fill",
    width,
    height,
    quality: "auto",
    fetch_format: "auto",
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  getThumbnailUrl,
};
