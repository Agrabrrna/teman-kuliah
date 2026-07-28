const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

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
        semester: semester ? parseInt(semester) : 1,
        role: username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
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

    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.' });
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
          role: user.role,
          avatarUrl: user.avatarUrl,
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
        role: user.role,
        avatarUrl: user.avatarUrl,
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
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        initials: initials.toUpperCase()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'File tidak ditemukan' });

    // Upload to Cloudinary using streamifier
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars', public_id: `avatar_${req.user.id}_${Date.now()}` },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(file.buffer);
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError);
      return res.status(500).json({ error: 'Gagal mengunggah foto ke storage Cloudinary' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatarUrl: uploadResult.secure_url
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
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        initials: initials.toUpperCase()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memperbarui foto profil' });
  }
};
