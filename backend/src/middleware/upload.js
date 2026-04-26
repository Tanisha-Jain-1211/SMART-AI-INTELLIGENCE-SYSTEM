// Configures secure image uploads to Cloudinary using multer middleware.
const { URL } = require("url");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
if (cloudinaryUrl) {
  const parsedCloudinaryUrl = new URL(cloudinaryUrl);
  cloudinary.config({
    cloud_name: parsedCloudinaryUrl.hostname,
    api_key: decodeURIComponent(parsedCloudinaryUrl.username || ""),
    api_secret: decodeURIComponent(parsedCloudinaryUrl.password || "")
  });
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints/",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error("Only JPEG, PNG, and WEBP images are allowed");
      error.statusCode = 400;
      return cb(error);
    }
    return cb(null, true);
  }
});

const uploadImage = upload.single("image");

module.exports = { uploadImage };
