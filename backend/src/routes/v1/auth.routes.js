const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { protect } = require('../../middleware/auth');
const { registerValidator, loginValidator } = require('../../validators/auth.validator');
const validate = require('../../middleware/validate');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/update-me', authController.updateMe);

module.exports = router;
