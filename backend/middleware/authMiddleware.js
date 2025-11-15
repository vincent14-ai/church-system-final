import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded; // Attach user payload to request
    next();
  });
};
