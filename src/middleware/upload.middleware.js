import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { publicDir } from "../shared/paths.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileKey = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, fileKey);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

export const MAX_DOCUMENT_MEDIA_FILES = 3;
