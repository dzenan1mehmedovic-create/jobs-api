import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret);

    req.user = {
      userId: payload.userId,
      name: payload.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Authentication invalid",
    });
  }
};
