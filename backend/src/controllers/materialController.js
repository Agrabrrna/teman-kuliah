const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();

// Setup Supabase Client for Storage
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.getMaterials = async (req, res) => {
  res.status(200).json({ message: 'Get Materials endpoint' });
};

exports.uploadMaterial = async (req, res) => {
  res.status(201).json({ message: 'Upload Material endpoint' });
};

exports.deleteMaterial = async (req, res) => {
  res.status(200).json({ message: 'Delete Material endpoint' });
};
