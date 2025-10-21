import express from "express";
import { exportMembers } from "../controller/exportController.js";

const router = express.Router();

router.get("/members/export", exportMembers);   // supports query string params
router.post("/members/export", exportMembers);  // supports JSON filters in body

export default router;