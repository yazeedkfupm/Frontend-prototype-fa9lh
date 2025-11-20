import { useState } from "react";

export default function Quiz() {
  const [choice, setChoice] = useState(1); // show a selected option like the mock
  const correct = 1;
  const options = ["variable x = 10;","let x = 10;","x := 10;","declare x = 10;"];
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button className="text-sm underline mb-4">← Back to Quizzes</button>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{width:'30%'}} />
      </div>
      <h1 className="text-2xl font-bold mt-4">JavaScript Fundamentals</h1>
      <p className="text-gray-600">Test your knowledge of JavaScript basics</p>

      <section className="mt-6 card p-4">
        <div className="text-sm text-gray-500">Question 3 of 10</div>
        <div className="font-medium mt-2">Which of the following is the correct way to declare a variable in JavaScript?</div>
        <div className="mt-3 space-y-2">
          {options.map((o,i)=>{
            const selected = choice === i;
            const isCorrect = i === correct;
            return (
              <button key={i} onClick={()=>setChoice(i)} className={`w-full text-left border rounded-md px-3 py-2 ${selected ? 'bg-gray-50' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className="mt-1">{selected ? '◉' : '◯'}</span>
                  <div className="flex-1">
                    <div>{o}</div>
                    {selected && (
                      <div className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? 'Correct! “let” is a valid way to declare variables.' : 'Incorrect. This is not valid JavaScript syntax.'}
                      </div>
                    )}
                  </div>
                  {selected && (isCorrect ? <span className="text-green-600">✓</span> : <span className="text-red-600">✕</span>)}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 p-3 border rounded-md bg-gray-50 text-sm">
          <div className="font-medium mb-1">Explanation</div>
          In JavaScript, variables can be declared using <code>let</code>, <code>const</code>, or <code>var</code>. The <code>let</code> keyword is preferred for reassignable variables.
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="btn">← Previous</button>
          <div className="flex gap-2">
            <button className="btn">Skip Question</button>
            <button className="btn btn-primary">Next Question →</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="card p-3 text-center"><div className="font-semibold">2</div><div className="text-xs text-gray-600">Correct</div></div>
        <div className="card p-3 text-center"><div className="font-semibold">1</div><div className="text-xs text-gray-600">Incorrect</div></div>
        <div className="card p-3 text-center"><div className="font-semibold">67%</div><div className="text-xs text-gray-600">Accuracy</div></div>
      </div>
    </div>
  );
}
