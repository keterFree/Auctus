require('dotenv').config();
const multer = require('multer');
const storage = multer.memoryStorage();

// export multer.upload()
exports.upload = multer({ storage: storage });