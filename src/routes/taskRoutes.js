const express = require('express');
const router = express.Router();

// Destructure the specific methods from your controller
const { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask,
  addNote,
  deleteNote
} = require('../controllers/taskController');

// Chain routes for the root path ('/')
router.route('/')
  .post(createTask)
  .get(getTasks);

// Chain routes for the dynamic ID path ('/:id')
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.post("/:id/note", addNote);
router.delete("/:taskId/note/:noteId", deleteNote);

module.exports = router;