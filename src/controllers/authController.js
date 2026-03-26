import bcrypt from "bcryptjs";
import { pool } from "../db/connect.js";
import { createToken } from "../utils/createToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Please provide name, email and password",
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    const user = {
      id: result.insertId,
      name,
    };

    const token = createToken(user);

    return res.status(201).json({
      user: {
        id: user.id,
        name,
        email,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Please provide email and password",
      });
    }

    const [users] = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const user = users[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};
