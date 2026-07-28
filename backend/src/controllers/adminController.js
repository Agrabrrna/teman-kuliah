const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalMaterials = await prisma.material.count();
    const totalSchedules = await prisma.schedule.count();
    const totalQuizzes = await prisma.quizAttempt.count();

    res.status(200).json({
      totalUsers,
      totalMaterials,
      totalSchedules,
      totalQuizzes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        username: true,
        name: true,
        prodi: true,
        semester: true,
        createdAt: true,
        _count: {
          select: { todos: true, schedules: true, quizAttempts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
  }
};
