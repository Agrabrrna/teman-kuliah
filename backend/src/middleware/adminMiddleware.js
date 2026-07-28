const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Belum login' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya Admin' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kesalahan server' });
  }
};

module.exports = adminMiddleware;
