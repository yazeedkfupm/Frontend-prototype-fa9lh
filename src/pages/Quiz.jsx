import { useMemo, useState } from "react";

const questions = [
  {
    id: 1,
    prompt: "Which of the following is the correct way to declare a variable in JavaScript?",
    options: ["variable x = 10;","let x = 10;","x := 10;","declare x = 10;"],
    answer: 1,
    explanation: "In JavaScript, use let/const/var. let is preferred for reassignable variables.",
    correctFeedback: "Correct! “let” is a valid declaration keyword.",
    incorrectFeedback: "Incorrect. Only let/const/var work in modern JavaScript.",
  },
  {
    id: 2,
    prompt: "Which method converts JSON text into a JavaScript object?",
    options: ["JSON.stringify","JSON.parse","Object.fromJSON","JSON.toObject"],
    answer: 1,
    explanation: "JSON.parse converts JSON strings into objects.",
    correctFeedback: "Correct! JSON.parse reads JSON text and returns objects.",
    incorrectFeedback: "Incorrect. JSON.stringify turns objects into strings, the opposite direction.",
  },
  {
    id: 3,
    prompt: "What keyword declares a variable whose value cannot be reassigned?",
    options: ["let","var","const","static"],
    answer: 2,
    explanation: "const creates a read-only binding to the value.",
    correctFeedback: "Correct! const prevents reassignment of the binding.",
    incorrectFeedback: "Incorrect. Remember that const locks the identifier to its initial value.",
  },
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("in-progress"); // in-progress | completed

  const active = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const summary = useMemo(() => {
    const correct = Object.entries(answers).filter(([id, choice]) => {
      const q = questions.find((qs) => String(qs.id) === id);
      return q && q.answer === choice;
    }).length;
    const attempted = Object.keys(answers).length;
    const incorrect = Math.max(0, attempted - correct);
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    return { correct, incorrect, accuracy };
  }, [answers]);

  function selectChoice(optionIndex){
    if (status === "completed") return;
    setAnswers((prev) => ({ ...prev, [active.id]: optionIndex }));
  }

  function goToQuestion(step){
    setCurrent((prev) => Math.max(0, Math.min(questions.length - 1, prev + step)));
  }

  function skipQuestion(){
    goToQuestion(1);
  }

  function finishQuiz(){
    setStatus("completed");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button className="text-sm underline mb-4">← Back to Quizzes</button>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{width:`${progress}%`}} />
      </div>
      <h1 className="text-2xl font-bold mt-4">JavaScript Fundamentals</h1>
      <p className="text-gray-600">Test your knowledge of JavaScript basics</p>

      <section className="mt-6 card p-4">
        <div className="text-sm text-gray-500">Question {current + 1} of {questions.length}</div>
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
            <button className="btn" onClick={skipQuestion} disabled={current===questions.length-1}>Skip Question</button>
            {current === questions.length - 1 ? (
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
