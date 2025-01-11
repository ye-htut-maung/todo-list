import express from "express";
import tasks from "./routes/tasks.js";

const port = process.env.PORT || 8000;

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// User Authentication

// Task Management Routes
app.use("/api/tasks", tasks);

app.listen(port, () => console.log(`Server is running on port ${port}`));
