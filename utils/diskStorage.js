const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

module.exports = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.env.STORAGE_DIR, 'avatars'));
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(32, (err, buffer) => {
      cb(null, buffer.toString('hex') + '.png');
    });
  }
})