import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../lib/api';

export default function KuisPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);

  const [started,  setStarted]  = useState(false);
  const [qIdx,     setQIdx]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score,    setScore]    = useState(0);
  const [finished, setFinished] = useState(false);
  const [log,      setLog]      = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/quiz/questions');
      const mapped = res.data.map(q => ({
        ...q,
        correct: q.correctIndex
      }));
      setQuestions(mapped);
      setLog(new Array(mapped.length).fill(null));
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const q = questions[qIdx];

  const answer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const nl = [...log]; nl[qIdx] = idx; setLog(nl);
    if (idx === q.correct) setScore((s) => s+1);
  };

  const next = async () => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i+1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      try {
        await api.post('/quiz/submit', {
          score: score + (selected === q.correct ? 1 : 0),
          totalQuestions: questions.length
        });
      } catch (error) {
        console.error("Failed to submit quiz score", error);
      }
    }
  };

  const restart = () => {
    setStarted(false); setQIdx(0); setSelected(null);
    setAnswered(false); setScore(0); setFinished(false);
    setLog(new Array(questions.length).fill(null));
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5"><HelpCircle size={28} className="text-violet-600" /></div>
          <h2 className="text-2xl font-extrabold text-foreground">Kuis Campuran</h2>
          <p className="text-muted-foreground text-sm mt-1.5">Uji pemahamanmu dari semua mata kuliah semester 3</p>
          <div className="grid grid-cols-3 gap-3 my-6">
            {[{ label:"Soal", value:`${questions.length}` },{ label:"Matkul", value:"5" },{ label:"Waktu", value:"Bebas" }].map(({ label, value }) => (
              <div key={label} className="bg-muted/60 rounded-xl py-3"><p className="text-xl font-extrabold text-foreground">{value}</p><p className="text-xs text-muted-foreground mt-0.5">{label}</p></div>
            ))}
          </div>
          <button onClick={() => setStarted(true)} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm">Mulai Kuis →</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore/questions.length)*100);
    const grade = pct>=80 ? { label:"Sangat Baik!",         emoji:"🏆", color:"text-emerald-600" }
                : pct>=60 ? { label:"Baik!",                emoji:"👍", color:"text-blue-600" }
                :           { label:"Perlu Belajar Lagi",   emoji:"📚", color:"text-amber-600" };

    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="text-5xl mb-4">{grade.emoji}</div>
          <h2 className="text-2xl font-extrabold text-foreground">Kuis Selesai!</h2>
          <p className={`text-base font-bold mt-1 ${grade.color}`}>{grade.label}</p>
          <div className="my-5">
            <p className="text-5xl font-extrabold text-foreground">{finalScore}/{questions.length}</p>
            <p className="text-muted-foreground text-sm mt-1">{pct}% jawaban benar</p>
          </div>
          <div className="space-y-2 text-left mb-6">
            {questions.map((qItem, i) => {
              const correct = log[i] === qItem.correct;
              return (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg text-xs ${correct ? "bg-emerald-50" : "bg-red-50"}`}>
                  {correct ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />}
                  <span className={correct ? "text-emerald-800" : "text-red-800"}>{qItem.question.substring(0,55)}…</span>
                </div>
              );
            })}
          </div>
          <button onClick={restart} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Soal {qIdx+1} dari {questions.length}</span>
        <span className="text-violet-600 font-bold">{q.subject}</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width:`${(qIdx/questions.length)*100}%` }} />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="text-base font-bold text-foreground leading-relaxed">{q.question}</p>
        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, idx) => {
            let cls = "border-border hover:border-violet-300 hover:bg-violet-50/60 cursor-pointer";
            if (answered) {
              if (idx===q.correct)                        cls = "border-emerald-400 bg-emerald-50";
              else if (idx===selected && idx!==q.correct) cls = "border-red-400 bg-red-50";
              else                                         cls = "border-border opacity-40 cursor-default";
            }
            return (
              <button key={idx} onClick={() => answer(idx)} className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${cls}`}>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      answered && idx===q.correct                        ? "border-emerald-500 bg-emerald-500 text-white"
                      : answered && idx===selected && idx!==q.correct   ? "border-red-500 bg-red-500 text-white"
                      :                                                    "border-muted-foreground/30 text-muted-foreground"
                    }`}
                    style={{ fontFamily:"'DM Mono', monospace" }}
                  >
                    {String.fromCharCode(65+idx)}
                  </span>
                  <span className="text-sm font-medium text-foreground">{opt}</span>
                  {answered && idx===q.correct && <CheckCircle2 size={15} className="text-emerald-500 ml-auto flex-shrink-0" />}
                  {answered && idx===selected && idx!==q.correct && <XCircle size={15} className="text-red-500 ml-auto flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-blue-700 mb-1">💡 Penjelasan</p>
            <p className="text-sm text-blue-800">{q.explanation}</p>
          </div>
        )}
      </div>

      {answered && (
        <button onClick={next} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm">
          {qIdx+1 < questions.length ? "Soal Berikutnya →" : "Lihat Hasil"}
        </button>
      )}
    </div>
  );
}
