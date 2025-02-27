const express = require('express');
const router = express.Router();
const usersController = require('../controllers/Userscontroller');

router.post('/register', usersController.register); // Register user
router.post('/login', usersController.login); // Login as user
router.get('/username/:username', usersController.getUserByUsername); // Get user by name
router.put('/username/:username', usersController.updateUser); // Update the user by name
router.delete('/username/:username', usersController.deleteUser); // Delete user by name

module.exports = router;
