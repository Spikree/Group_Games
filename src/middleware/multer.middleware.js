import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const prefix = req.params.id ? `${req.params.id}-` : "";
    cb(null, `${prefix}${unique}${ext}`);
  }
});

const filterFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed."));
  }
}

const limits = {
  fileSize: 10 * 1024 * 1024,
};

const upload = multer({ storage, filterFilter, limits });

export default upload;
