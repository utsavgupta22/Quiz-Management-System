const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/quizzes
// @desc    Get all quizzes (public list)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).select('_id title createdAt');
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID (public - for taking quiz)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Return quiz without correct answers for public access
    const publicQuiz = {
      _id: quiz._id,
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        type: q.type,
        question: q.question,
        options: q.options
        // correctAnswer is intentionally omitted
      }))
    };
    
    res.json(publicQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide title and at least one question' });
    }

    const quiz = await Quiz.create({
      title,
      questions
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide title and at least one question' });
    }

    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.title = title;
    quiz.questions = questions;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers and get results
// @access  Public
router.post('/:id/submit', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { answers } = req.body; // { questionId: userAnswer }
    
    if (!answers) {
      return res.status(400).json({ message: 'Please provide answers' });
    }

    let score = 0;
    const results = quiz.questions.map(question => {
      const userAnswer = answers[question._id.toString()];
      const isCorrect = userAnswer && 
        userAnswer.toString().toLowerCase().trim() === 
        question.correctAnswer.toString().toLowerCase().trim();
      
      if (isCorrect) score++;

      return {
        questionId: question._id,
        question: question.question,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    res.json({
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      correctAnswers: score,
      percentage: Math.round((score / quiz.questions.length) * 100),
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
