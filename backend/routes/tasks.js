import express from "express";

const router = express.Router();

let tasks = [
  {
    id: 1,
    user_id: 1,
    title: "Todo 1",
    description: "This is to do",
    status: "incomplete",
  },
  {
    id: 2,
    user_id: 2,
    title: "Todo 2",
    description: "This is to do 2",
    status: "completed",
  },
];

// Create a task
router.post("/", (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    description: req.body.description,
    status: "incomplete",
  };

  if (!newTask.title || !newTask.status) {
    return res.status(400).json({ msg: "Please include title or status" });
  }

  tasks.push(newTask);
  res.status(201).json(tasks);
});

// Get all tasks
router.get("/", (req, res) => {
  const status = req.query.status;

  if (status == "incomplete") {
    return res
      .status(200)
      .json(tasks.filter((task) => task.status === "incomplete"));
  }
  if (status == "completed") {
    return res
      .status(200)
      .json(tasks.filter((task) => task.status === "completed"));
  }
  res.status(200).json(tasks);
});

// Get task by id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res
      .status(404)
      .json({ msg: `A task with the id of ${id} was not found` });
  }
  res.status(200).json(task);
});

// Update a task's status or details
router.patch("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((post) => post.id === id);

  if (!task) {
    return res
      .status(404)
      .json({ msg: `A task with the id of ${id} was not found` });
  }

  if (req.body.title) {
    task.title = req.body.title;
  }

  if (req.body.description) {
    task.description = req.body.description;
  }

  if (req.body.status) {
    task.status = req.body.status;
  }

  res.status(200).json(tasks);
});

// Delete task
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((post) => post.id === id);

  if (!task) {
    return res
      .status(404)
      .json({ msg: `A task with the id of ${id} was not found` });
  }
  tasks = tasks.filter((task) => task.id !== id);
  res.status(200).json(tasks);
});

export default router;
