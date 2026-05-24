const multer = require('multer');

const storage = multer.memoryStorage();

function wrapUpload(upload) {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  };
}

const uploadProfilePicture = wrapUpload(
  multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single('profilePicture')
);

const uploadTaxRegistry = wrapUpload(
  multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed'));
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single('taxRegistry')
);

module.exports = { uploadProfilePicture, uploadTaxRegistry };
