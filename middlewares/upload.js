// middlewares/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const generateSafeName = bytes => 
  crypto.randomBytes(bytes).toString('hex');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${generateSafeName(16)}${ext}`;
    cb(null, filename);
  }
});

const fileTypeValidations = {
  profile: {
    mime: /^image\/(jpeg|png|webp)$/,
    ext: /\.(jpe?g|png|webp)$/i,
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  general: {
    mime: /^(image|application\/pdf|text\/plain)/,
    ext: /\.(jpe?g|png|pdf|txt)$/i,
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};

const fileFilter = (req, file, cb) => {
  try {
    const fileType = req.body.type === 'profile' ? 'profile' : 'general';
    const { mime, ext, maxSize } = fileTypeValidations[fileType];

    if (!mime.test(file.mimetype) || !ext.test(file.originalname)) {
      return cb(new Error('Invalid file type'), false);
    }

    if (file.size > maxSize) {
      return cb(new Error('File size exceeds limit'), false);
    }

    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

const messageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

const processImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const needsResize = metadata.width > 800 || metadata.height > 800;
    
    if (needsResize) {
      await sharp(filePath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .toFormat('webp')
        .toFile(`${filePath}.webp`);
      
      await fs.unlink(filePath);
      await fs.rename(`${filePath}.webp`, filePath);
    }

    if (metadata.format !== 'webp') {
      await sharp(filePath)
        .toFormat('webp')
        .toFile(`${filePath}.webp`);
      
      await fs.unlink(filePath);
      await fs.rename(`${filePath}.webp`, filePath);
    }
  } catch (err) {
    await fs.unlink(filePath);
    throw err;
  }
};

module.exports = {
  messageUpload,
  processImage
};