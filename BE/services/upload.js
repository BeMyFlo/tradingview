import multer from "multer";

const upload = multer({ storage });
const storage = multer.memoryStorage();

export { upload };
