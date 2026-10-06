"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";

interface Question {
  id: string;
  text: string;
  options: { text: string }[];
}

export default function PruebaPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; optionIndex: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/personality")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/advertencia");
          return;
        }
        setQuestions(data.questions);
        setLoading(false);
      });
  }, [router]);

  function handleAnswer(optionIndex: number) {
    const q = questions[currentIndex];
    const newAnswers = [...answers, { questionId: q.id, optionIndex }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAnswers(newAnswers);
    }
  }

  async function submitAnswers(finalAnswers: typeof answers) {
    setSubmitting(true);
    const res = await fetch("/api/personality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    });
    if (res.ok) {
      router.push("/resultado");
    } else {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <GameShell>
        <div className="flex flex-1 items-center justify-center terminal-text">...</div>
      </GameShell>
    );
  }

  if (submitting) {
    return (
      <GameShell>
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="narrative-text text-[var(--text-muted)] fade-in">
            El archivo te observa.
          </p>
        </div>
      </GameShell>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <GameShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 h-px bg-[var(--border-subtle)]">
            <div
              className="h-px bg-[var(--accent-gold-dim)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="terminal-text mb-4 text-xs">
            {currentIndex + 1} / {questions.length}
          </p>
          <h2 className="narrative-text mb-8 text-xl">{q.text}</h2>
          <div className="space-y-3" role="listbox" aria-label="Opciones">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => handleAnswer(i)}
                className="panel-arcane w-full text-left narrative-text text-[var(--text-muted)] hover:border-[var(--accent-gold-dim)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
