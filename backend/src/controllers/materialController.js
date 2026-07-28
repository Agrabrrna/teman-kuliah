const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.getMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadedAt: 'desc' }
    });
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil materi' });
  }
};

exports.uploadMaterial = async (req, res) => {
  try {
    const { subject } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'File tidak ditemukan' });

    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: 'Gagal mengunggah file ke storage' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);

    const material = await prisma.material.create({
      data: {
        userId: req.user.id,
        fileName: file.originalname,
        fileUrl: publicUrlData.publicUrl,
        subject: subject || 'Umum',
      }
    });

    res.status(201).json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengunggah materi' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.material.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Materi tidak ditemukan' });

    // Try delete from storage (optional, based on your bucket structure)
    if (existing.fileUrl) {
      const urlParts = existing.fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('materials').remove([fileName]);
    }

    await prisma.material.delete({ where: { id } });
    res.status(200).json({ message: 'Materi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus materi' });
  }
};
