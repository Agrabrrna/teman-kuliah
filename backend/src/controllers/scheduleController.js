const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: req.user.id }
    });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil jadwal' });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { subject, day, startTime, endTime, room } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        userId: req.user.id,
        subject,
        day,
        startTime,
        endTime,
        room
      }
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat jadwal' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, day, startTime, endTime, room } = req.body;
    
    const existing = await prisma.schedule.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        subject: subject !== undefined ? subject : existing.subject,
        day: day !== undefined ? day : existing.day,
        startTime: startTime !== undefined ? startTime : existing.startTime,
        endTime: endTime !== undefined ? endTime : existing.endTime,
        room: room !== undefined ? room : existing.room,
      }
    });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah jadwal' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.schedule.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });

    await prisma.schedule.delete({ where: { id } });
    res.status(200).json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus jadwal' });
  }
};
