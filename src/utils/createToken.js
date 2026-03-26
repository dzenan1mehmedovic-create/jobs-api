import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};
