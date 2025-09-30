const fs = require("fs");
const path = require("path");

/**
 * Save a Base64 image to the filesystem
 * @param {string} base64Image - The image in Base64 format
 * @param {string} folder - Destination folder (e.g., 'avatars', 'products')
 * @param {string} filename - File name without extension
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
const saveBase64Image = async (
  base64Image,
  folder = "avatars",
  filename = null
) => {
  try {
    // Check if the image is in Base64 format
    if (!base64Image.startsWith("data:image/")) {
      return {
        success: false,
        error: "Invalid image format. Expected Base64 image.",
      };
    }

    // Extract MIME type and Base64 data
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return {
        success: false,
        error: "Invalid Base64 image format",
      };
    }

    const mimeType = matches[1];
    const imageData = matches[2];

    // Check allowed MIME types
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

    // Create the folder if it does not exist
    const uploadDir = path.join(__dirname, "..", "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique file name
    const extension = mimeType.split("/")[1];
    const uniqueFilename = filename
      ? `${filename}-${Date.now()}.${extension}`
      : `image-${Date.now()}.${extension}`;

    const filePath = path.join(uploadDir, uniqueFilename);

    // Save the image
    fs.writeFileSync(filePath, imageData, "base64");

    // Return relative path for URL
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
 * Delete an image from the filesystem
 * @param {string} imagePath - Path to the image to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) {
      return { success: true }; // No image to delete
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
 * Validate a Base64 image
 * @param {string} base64Image - The image in Base64 format
 * @param {number} maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const validateBase64Image = async (base64Image, maxSizeMB = 5) => {
  try {
    // Check if it's a Base64 image
    if (!base64Image.startsWith("data:image/")) {
      return {
        success: false,
        error: "Invalid image format. Expected Base64 image.",
      };
    }

    // Extract MIME type and Base64 data
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return {
        success: false,
        error: "Invalid Base64 image format",
      };
    }
    /**
     * Ensure the regex matched the string and has exactly 3 elements:
     * matches[0] → the complete string
     * matches[1] → the MIME type
     * matches[2] → the Base64 data
     */

    const mimeType = matches[1]; // e.g., image/png
    const imageData = matches[2]; // Base64 data

    // Check allowed MIME types
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

    // Check size in MB (1 Base64 character = 6 bits, so 4 chars = 3 bytes)
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
