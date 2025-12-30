import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import memberRoutes from "./route/memberRoutes.js";
import authRoutes from "./route/authRoutes.js";
import exportRoutes from "./route/exportRoutes.js";
import importRoutes from "./route/importRoutes.js";
import attendanceRoutes from "./route/attendanceRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/import", importRoutes);
app.use("/api/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
