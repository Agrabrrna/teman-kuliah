const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotes = async (req, res) => {
  res.status(200).json({ message: 'Get Notes endpoint' });
};

exports.getNoteById = async (req, res) => {
  res.status(200).json({ message: 'Get Note by ID endpoint' });
};

exports.createNote = async (req, res) => {
  res.status(201).json({ message: 'Create Note endpoint' });
};

exports.updateNote = async (req, res) => {
  res.status(200).json({ message: 'Update Note endpoint' });
};

exports.deleteNote = async (req, res) => {
  res.status(200).json({ message: 'Delete Note endpoint' });
};
