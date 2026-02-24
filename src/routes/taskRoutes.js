const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// 1. POST request to create a new task
router.post('/', taskController.createTask);

// 2. GET request to fetch all tasks
router.get('/', taskController.getTasks);

// 3. PUT request to update a specific task by its ID
router.put('/:id', taskController.updateTask);

// 4. DELETE request to remove a specific task by its ID
router.delete('/:id', taskController.deleteTask);

module.exports = router;