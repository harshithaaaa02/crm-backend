const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const newTask = new Task({ ...req.body, user: req.user.id });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};