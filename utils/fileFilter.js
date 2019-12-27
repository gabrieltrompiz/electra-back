module.exports = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    req.res.status(409).json({
      status: 409,
      message: 'File must be photo'
    })
  }
  cb(null, true);
}