import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

const QUIZ_ID = "quiz-js-fundamentals";

export default function Quiz() {
  const { api } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("in-progress");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverSummary, setServerSummary] = useState({ correct: 0, incorrect: 0, accuracy: 0 });

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api(`/quizzes/${QUIZ_ID}`);
      setQuiz(payload.quiz);
    } catch (err) {
      setError(err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const active = quiz?.questions[current];
  const progress = quiz ? ((current + 1) / quiz.questions.length) * 100 : 0;

  const derivedSummary = useMemo(() => {
    if (!quiz) return { correct: 0, incorrect: 0, accuracy: 0 };
    const correct = quiz.questions.filter((question) => answers[question.id] === question.answer).length;
    const attempted = Object.keys(answers).length;
    const incorrect = Math.max(0, attempted - correct);
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    return { correct, incorrect, accuracy };
  }, [answers, quiz]);

  const summary = status === "completed" ? serverSummary : derivedSummary;

  function selectChoice(optionIndex){
    if (status === "completed" || !active) return;
    setAnswers((prev) => ({ ...prev, [active.id]: optionIndex }));
  }

  function goToQuestion(step){
    if (!quiz) return;
    setCurrent((prev) => Math.max(0, Math.min(quiz.questions.length - 1, prev + step)));
  }

  function skipQuestion(){
    goToQuestion(1);
  }

  async function finishQuiz(){
    if (!quiz || status === "completed") return;
    setError(null);
    try {
      const response = await api(`/quizzes/${QUIZ_ID}/submit`, {
        method: "POST",
        body: { answers },
      });
      setServerSummary(response.summary);
    } catch (err) {
      setServerSummary({ correct: 0, incorrect: 0, accuracy: 0 });
      setError(err.message || "Unable to submit quiz");
    } finally {
      setStatus("completed");
    }
  }

  if (loading){
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        Loading quiz…
      </div>
    );
  }

  if (error && !quiz){
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{error}</p>
        <button className="btn mt-4" onClick={loadQuiz}>Retry</button>
      </div>
    );
  }

  if (!quiz || !active){
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button className="text-sm underline mb-4">← Back to Quizzes</button>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{width:`${progress}%`}} />
      </div>
      <h1 className="text-2xl font-bold mt-4">{quiz.title}</h1>
      <p className="text-gray-600">{quiz.description}</p>

      <section className="mt-6 card p-4">
        <div className="text-sm text-gray-500">Question {current + 1} of {quiz.questions.length}</div>
        <div className="font-medium mt-2">{active.prompt}</div>
        <div className="mt-3 space-y-2">
          {active.options.map((option, index) => {
            const selected = answers[active.id] === index;
            const isCorrect = index === active.answer;
            const reveal = selected || status === "completed";
            const feedbackShown = reveal && (selected || status === "completed");
            return (
              <button
                key={index}
                onClick={()=>selectChoice(index)}
                className={`w-full text-left border rounded-md px-3 py-2 ${selected ? 'bg-gray-50' : ''}`}
                disabled={status === 'completed'}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1">{selected ? '◉' : '◯'}</span>
                  <div className="flex-1">
                    <div>{option}</div>
                    {feedbackShown && (
                      <div className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? active.correctFeedback : active.incorrectFeedback}
                      </div>
                    )}
                  </div>
                  {feedbackShown && (isCorrect ? <span className="text-green-600">✓</span> : selected ? <span className="text-red-600">✕</span> : null)}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 p-3 border rounded-md bg-gray-50 text-sm">
          <div className="font-medium mb-1">Explanation</div>
          {active.explanation}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="btn" onClick={()=>goToQuestion(-1)} disabled={current===0}>← Previous</button>
          <div className="flex gap-2">
            <button className="btn" onClick={skipQuestion} disabled={current===quiz.questions.length-1}>Skip Question</button>
            {current === quiz.questions.length - 1 ? (
              <button className="btn btn-primary" onClick={finishQuiz} disabled={status==='completed'}>
                {status==='completed' ? 'Quiz Completed' : 'Finish Quiz'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={()=>goToQuestion(1)}>Next Question →</button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="card p-3 text-center"><div className="font-semibold">{summary.correct}</div><div className="text-xs text-gray-600">Correct</div></div>
        <div className="card p-3 text-center"><div className="font-semibold">{summary.incorrect}</div><div className="text-xs text-gray-600">Incorrect</div></div>
        <div className="card p-3 text-center"><div className="font-semibold">{summary.accuracy}%</div><div className="text-xs text-gray-600">Accuracy</div></div>
      </div>
    </div>
  );
}
