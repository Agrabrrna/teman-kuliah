const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTodos = async (req, res) => {
  res.status(200).json({ message: 'Get Todos endpoint' });
};

exports.createTodo = async (req, res) => {
  res.status(201).json({ message: 'Create Todo endpoint' });
};

exports.updateTodo = async (req, res) => {
  res.status(200).json({ message: 'Update Todo endpoint' });
};

exports.deleteTodo = async (req, res) => {
  res.status(200).json({ message: 'Delete Todo endpoint' });
};
