import express from "express";
import multer from "multer";
import { importMembers } from "../controller/importController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

router.post("/", upload.single("file"), importMembers);

export default router;
