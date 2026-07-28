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
      select: {
        id: true,
        username: true,
        name: true,
        prodi: true,
        semester: true,
        role: true,
        isActive: true,
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

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }

    // Prevent changing own role (optional, but good practice)
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Tidak dapat mengubah role akun sendiri' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.status(200).json({ message: 'Role berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memperbarui role' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'Status tidak valid' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Tidak dapat menonaktifkan akun sendiri' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive }
    });

    res.status(200).json({ message: 'Status pengguna berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memperbarui status pengguna' });
  }
};
