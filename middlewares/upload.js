// middlewares/upload.js
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

const MAX_PROFILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_GENERAL_SIZE = 5 * 1024 * 1024; // 5MB

const generateSafeName = (bytes) => crypto.randomBytes(bytes).toString("hex");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = "uploads/";
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${generateSafeName(16)}${ext}`;
    cb(null, filename);
  },
});

// Choose validation rules based on req.body.type
const fileTypeValidations = {
  profile: {
    mime: /^image\/(jpeg|png|webp)$/i,
    ext: /\.(jpe?g|png|webp)$/i,
    maxSize: MAX_PROFILE_SIZE,
  },
  general: {
    mime: /^(image\/(jpeg|png|webp|gif)|application\/pdf|text\/plain)$/i,
    ext: /\.(jpe?g|png|webp|pdf|txt|gif)$/i,
    maxSize: MAX_GENERAL_SIZE,
  },
};

const fileFilter = (req, file, cb) => {
  try {
    const fileType = req.body.type === "profile" ? "profile" : "general";
    const { mime, ext, maxSize } = fileTypeValidations[fileType];

    if (!mime.test(file.mimetype) || !ext.test(file.originalname)) {
      return cb(new Error("Invalid file type or extension"), false);
    }
    // (Multer also enforces limits, but this is an extra check)
    if (file.size > maxSize) {
      return cb(new Error("File size exceeds limit"), false);
    }
    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_GENERAL_SIZE, files: 1 },
});

// Process image using sharp (resize and convert to WebP)
const processImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const needsResize = metadata.width > 800 || metadata.height > 800;
    if (needsResize) {
      await sharp(filePath)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .toFormat("webp")
        .toFile(`${filePath}.webp`);
      await fs.unlink(filePath);
      await fs.rename(`${filePath}.webp`, filePath);
    }
    if (metadata.format !== "webp") {
      await sharp(filePath)
        .toFormat("webp")
        .toFile(`${filePath}.webp`);
      await fs.unlink(filePath);
      await fs.rename(`${filePath}.webp`, filePath);
    }
  } catch (err) {
    await fs.unlink(filePath).catch(() => {});
    throw err;
  }
};

module.exports = { uploadMiddleware, processImage };
