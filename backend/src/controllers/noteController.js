const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotes = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil catatan' });
  }
};

exports.getNoteById = async (req, res) => {
  res.status(200).json({ message: 'Get Note by ID endpoint' });
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, subject } = req.body;
    const note = await prisma.note.create({
      data: {
        userId: req.user.id,
        title,
        content,
        subject: subject || 'Umum',
      }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat catatan' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, subject } = req.body;
    
    const existing = await prisma.note.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Catatan tidak ditemukan' });

    const note = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        subject: subject !== undefined ? subject : existing.subject,
      }
    });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah catatan' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.note.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Catatan tidak ditemukan' });

    await prisma.note.delete({ where: { id } });
    res.status(200).json({ message: 'Catatan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus catatan' });
  }
};
