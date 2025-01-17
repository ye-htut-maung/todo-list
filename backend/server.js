import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import tasksRoutes from "./routes/tasks.js";
import usersRoutes from "./routes/users.js";

const { Pool } = pkg;

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// User Route
app.use("/api/users", usersRoutes(pool));

// Task Management Routes
app.use("/api/tasks", tasksRoutes(pool));

app.listen(port, () => console.log(`Server is running on port ${port}`));
