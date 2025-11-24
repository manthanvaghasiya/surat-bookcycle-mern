const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Files will be saved in the 'backend/uploads' folder
    },
    filename(req, file, cb) {
        // Naming format: fieldname-date-extension (e.g., image-123456789.jpg)
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Check file type (Allow only images)
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;