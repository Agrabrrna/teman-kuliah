const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getQuestions = async (req, res) => {
  res.status(200).json({ message: 'Get Quiz Questions endpoint' });
};

exports.submitQuiz = async (req, res) => {
  res.status(201).json({ message: 'Submit Quiz endpoint' });
};

exports.getAttempts = async (req, res) => {
  res.status(200).json({ message: 'Get Quiz Attempts endpoint' });
};
