const Task = require('../models/Task');

// 1. CREATE a new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Failed to create task", error: error.message });
  }
};

// 2. READ all tasks (Optimized for Read-Only Performance)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('leadId', 'company')
      .lean(); // <-- NEW: Strips heavy Mongoose features for a massive speed boost
      
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// 3. UPDATE a task (Optimized for Data Integrity)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true, 
        runValidators: true // <-- NEW: Forces updates to follow your Schema rules!
      }
    );
    
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: "Failed to update task", error: error.message });
  }
};

// 4. DELETE a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    res.status(200).json({ message: "Task deleted successfully", id: req.params.id }); 
    // ^ NEW: Sending the ID back helps the React UI instantly remove it without a refresh
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};