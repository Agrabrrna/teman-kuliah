const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil todos' });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, subject, deadline, priority } = req.body;
    const todo = await prisma.todo.create({
      data: {
        userId: req.user.id,
        title,
        subject: subject || 'Umum',
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || 'medium',
      }
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat todo' });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, priority, due } = req.body;
    
    // Check if exists and belongs to user
    const existing = await prisma.todo.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Todo tidak ditemukan' });

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        completed: completed !== undefined ? completed : existing.completed,
        priority: priority !== undefined ? priority : existing.priority,
      }
    });
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah todo' });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.todo.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Todo tidak ditemukan' });

    await prisma.todo.delete({ where: { id } });
    res.status(200).json({ message: 'Todo berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus todo' });
  }
};
