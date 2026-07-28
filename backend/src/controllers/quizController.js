const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_QUIZ = [
  { subject:"Kalkulus II",     question:"Turunan dari f(x) = sin(3x) adalah...",                                        options:["3cos(3x)","cos(3x)","−3cos(3x)","3sin(3x)"],                          correctIndex:0, explanation:"Aturan rantai: d/dx[sin(u)] = cos(u)·u'. Karena u=3x → u'=3, hasilnya 3cos(3x)." },
  { subject:"Fisika Dasar",    question:"Benda bermassa 5 kg dikenai gaya 20 N. Percepatannya adalah...",               options:["2 m/s²","4 m/s²","100 m/s²","0,25 m/s²"],                             correctIndex:1, explanation:"F = m × a → a = F/m = 20 ÷ 5 = 4 m/s²" },
  { subject:"Pemrograman Web", question:"HTTP method untuk memperbarui SEBAGIAN data resource adalah...",               options:["GET","POST","PATCH","DELETE"],                                         correctIndex:2, explanation:"PATCH untuk partial update; PUT untuk full update/replace." },
  { subject:"Basis Data",      question:"Kondisi di mana setiap foreign key merujuk ke primary key yang valid disebut...", options:["Normalisasi","Referential Integrity","Indexing","Dependency"],    correctIndex:1, explanation:"Referential Integrity memastikan tidak ada orphan records — FK harus selalu valid." },
  { subject:"Bahasa Indonesia", question:"Bentuk baku dari kata 'analisa' menurut KBBI adalah...",                      options:["analisa","analisis","analis","analisisa"],                             correctIndex:1, explanation:"'Analisis' adalah bentuk baku. 'Analisa' merupakan bentuk tidak baku dari bahasa Belanda." },
];

exports.getQuestions = async (req, res) => {
  try {
    let questions = await prisma.quizQuestion.findMany();
    
    // Auto seed if empty
    if (questions.length === 0) {
      await prisma.quizQuestion.createMany({ data: DEFAULT_QUIZ });
      questions = await prisma.quizQuestion.findMany();
    }
    
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil soal kuis' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { score, totalQuestions } = req.body;
    
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.id,
        score,
        totalQuestions
      }
    });
    
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyimpan hasil kuis' });
  }
};

exports.getAttempts = async (req, res) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.id },
      orderBy: { takenAt: 'desc' }
    });
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat kuis' });
  }
};
