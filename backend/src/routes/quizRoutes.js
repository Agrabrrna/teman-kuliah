const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/questions', quizController.getQuestions);
router.post('/submit', quizController.submitQuiz);
router.get('/attempts', quizController.getAttempts);

module.exports = router;
