import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import memberRoutes from "./route/memberRoutes.js";
import authRoutes from "./route/authRoutes.js";
import exportRoutes from "./route/exportRoutes.js";
import importRoutes from "./route/importRoutes.js";
import attendanceRoutes from "./route/attendanceRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/import", importRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
