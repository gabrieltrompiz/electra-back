const multer = require('multer');
const crypto = require('crypto');

module.exports = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.STORAGE_DIR + '\\avatars\\');
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(32, (err, buffer) => {
      cb(null, buffer.toString('hex') + '.png');
    });
  }
})