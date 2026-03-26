import { pool } from "../db/connect.js";

export const getAllJobs = async (req, res) => {
  try {
    const { status, search, sort } = req.query;

    let query = "SELECT * FROM jobs WHERE created_by = ?";
    const values = [req.user.userId];

    if (status && status !== "all") {
      query += " AND status = ?";
      values.push(status);
    }

    if (search) {
      query += " AND position LIKE ?";
      values.push(`%${search}%`);
    }

    if (sort === "latest") {
      query += " ORDER BY created_at DESC";
    } else if (sort === "oldest") {
      query += " ORDER BY created_at ASC";
    } else if (sort === "a-z") {
      query += " ORDER BY position ASC";
    } else if (sort === "z-a") {
      query += " ORDER BY position DESC";
    } else {
      query += " ORDER BY created_at DESC";
    }

    const [jobs] = await pool.query(query, values);

    return res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

export const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE id = ? AND created_by = ?",
      [id, req.user.userId],
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    return res.status(200).json({
      job: jobs[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const { company, position, status } = req.body;

    if (!company || !position) {
      return res.status(400).json({
        error: "Please provide company and position",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO jobs (company, position, status, created_by) VALUES (?, ?, ?, ?)",
      [company, position, status || "pending", req.user.userId],
    );

    const [newJob] = await pool.query("SELECT * FROM jobs WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({
      job: newJob[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, status } = req.body;

    if (!company || !position) {
      return res.status(400).json({
        error: "Please provide company and position",
      });
    }

    const [existingJobs] = await pool.query(
      "SELECT * FROM jobs WHERE id = ? AND created_by = ?",
      [id, req.user.userId],
    );

    if (existingJobs.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    await pool.query(
      "UPDATE jobs SET company = ?, position = ?, status = ? WHERE id = ? AND created_by = ?",
      [company, position, status || "pending", id, req.user.userId],
    );

    const [updatedJob] = await pool.query(
      "SELECT * FROM jobs WHERE id = ? AND created_by = ?",
      [id, req.user.userId],
    );

    return res.status(200).json({
      job: updatedJob[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingJobs] = await pool.query(
      "SELECT * FROM jobs WHERE id = ? AND created_by = ?",
      [id, req.user.userId],
    );

    if (existingJobs.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    await pool.query("DELETE FROM jobs WHERE id = ? AND created_by = ?", [
      id,
      req.user.userId,
    ]);

    return res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};
