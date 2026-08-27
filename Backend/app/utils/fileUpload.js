const path = require('path');
const fs = require("fs");
const multer = require("multer");

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
    'image/gif':'gif',
    'image/bmp':'bmp'
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("Invalid Image type"); // Defined with capital 'E'

        if (isValid) {
            uploadError = null; // Set to null if valid
        }
        cb(uploadError, 'uploads'); // Called with capital 'E'
    },
    filename:function(req,file,cb){
        const fileName=file.originalname.split(' ').join('-')
        const extension=FILE_TYPE_MAP[file.mimetype]
        cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
})
const userImage = multer({storage:storage});
module.exports = userImage