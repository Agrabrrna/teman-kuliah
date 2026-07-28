const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { username, password, name, prodi, semester } = req.body;
    
    // Cek username
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        prodi,
        semester: semester ? parseInt(semester) : 1
      }
    });

    res.status(201).json({ message: 'Registrasi berhasil', user: { id: user.id, username: user.username, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Username atau password salah' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Username atau password salah' });
    }

    // Bikin initial biar kompatibel sama frontend
    const names = user.name.trim().split(" ");
    const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        prodi: user.prodi,
        semester: user.semester,
        initials: initials.toUpperCase()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const names = user.name.trim().split(" ");
    const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        prodi: user.prodi,
        semester: user.semester,
        initials: initials.toUpperCase()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, username, prodi, semester, email, phone, bio } = req.body;
    
    // Check if new username is taken by someone else
    if (username) {
      const existingUser = await prisma.user.findFirst({ where: { username } });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        username,
        prodi,
        semester: semester ? parseInt(semester) : undefined,
        email,
        phone,
        bio,
      }
    });

    const names = updated.name.trim().split(" ");
    const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);

    res.status(200).json({
      user: {
        id: updated.id,
        username: updated.username,
        name: updated.name,
        prodi: updated.prodi,
        semester: updated.semester,
        email: updated.email,
        phone: updated.phone,
        bio: updated.bio,
        initials: initials.toUpperCase()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
};
