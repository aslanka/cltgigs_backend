const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

// Create a disk storage to store original files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter to only allow images for gig attachments
function gigFileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only images are allowed for gig attachments'), false);
  }
  cb(null, true);
}

function generalFileFilter(req, file, cb) {
  // For message attachments we can allow any file type, or implement more checks
  cb(null, true);
}

const gigUpload = multer({
  storage: storage,
  fileFilter: gigFileFilter
});

const messageUpload = multer({
  storage: storage,
  fileFilter: generalFileFilter
});

// A helper function to resize images if needed
async function resizeImage(filePath, width = 800, height = 800) {
  const newFilePath = filePath.replace(/(\.\w+)$/, '-resized$1');
  try {
    await sharp(filePath)
      .resize({ width, height, fit: 'inside' })
      .toFile(newFilePath);
  } catch (sharpErr) {
    console.error('Error resizing image:', sharpErr);
    throw sharpErr;
  }

  try {
    if (await fsPromises.access(filePath).then(() => true).catch(() => false)) {
      await fsPromises.unlink(filePath);
    }
  } catch (unlinkErr) {
    console.error('Error deleting original file:', unlinkErr);
  }

  try {
    await fsPromises.rename(newFilePath, filePath);
  } catch (renameErr) {
    console.error('Error renaming resized file:', renameErr);
  }
}

module.exports = {
  gigUpload,
  messageUpload,
  resizeImage
};
