import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const tasksRoutes = (pool) => {
  const router = express.Router();

  // Protect all routes with authenticateToken
  router.use(authenticateToken);

  // Create a task
  router.post("/", async (req, res) => {
    const { userId, title, description } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ error: "User ID and title are required" });
    }
    try {
      const query = `
        INSERT INTO tasks (user_id, title, description, status) 
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;
      const values = [userId, title, description || null, "incomplete"];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error adding task: ", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get all tasks
  router.get("/", async (req, res) => {
    const status = req.query.status;

    try {
      const query = `
      SELECT * 
      FROM tasks
      ${status ? " WHERE status = $1" : ""}`;

      const values = status ? [status] : [];

      const result = await pool.query(query, values);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching tasks: ", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get task by id
  router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
      const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [
        id,
      ]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ msg: `A task with the id of ${id} was not found` });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Update a task's status or details
  router.patch("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    if (!title && !description && !status) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    if (status && !["completed", "incomplete"].includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status value. Allowed values are 'completed' and 'incomplete'.",
      });
    }

    try {
      const query = `
        UPDATE tasks
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            status = COALESCE($3, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *;
      `;
      const values = [title, description, status, id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Task with ID ${id} not found` });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Error updating task:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Delete task
  router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
      const result = await pool.query(
        "DELETE FROM tasks WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Task with ID ${id} not found` });
      }

      res
        .status(200)
        .json({ message: "Task deleted successfully", task: result.rows[0] });
    } catch (err) {
      console.error("Error deleting task:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};

export default tasksRoutes;
