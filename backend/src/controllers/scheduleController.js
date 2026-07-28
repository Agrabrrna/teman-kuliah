const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSchedules = async (req, res) => {
  res.status(200).json({ message: 'Get Schedules endpoint' });
};

exports.createSchedule = async (req, res) => {
  res.status(201).json({ message: 'Create Schedule endpoint' });
};

exports.updateSchedule = async (req, res) => {
  res.status(200).json({ message: 'Update Schedule endpoint' });
};

exports.deleteSchedule = async (req, res) => {
  res.status(200).json({ message: 'Delete Schedule endpoint' });
};
