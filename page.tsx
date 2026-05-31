'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

const startInterview = async () => {
    if (!jobDescription.trim()) return alert('Please enter a job description or role first!');
    setLoading(true);
    
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, chatHistory: [], currentAnswer: '' }),
      });
      const data = await res.json();
      
      // Fallback message if data comes back missing
      const questionText = data.nextQuestion || "Hello! Let's begin. Could you please tell me about yourself and your background relevant to this role?";
      
      setCurrentQuestion(questionText);
      setChatHistory([{ role: 'assistant', content: questionText }]);
      setStarted(true);
    } catch (err) {
      console.error(err);
      alert('Error starting interview. Check your terminal logs.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setLoading(true);

    const updatedHistory: Message[] = [
      ...chatHistory,
      { role: 'user', content: currentAnswer }
    ];
    setChatHistory(updatedHistory);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, chatHistory: updatedHistory, currentAnswer }),
      });
      const data = await res.json();

      if (data.feedback) {
        setFeedbacks((prev) => [...prev, data.feedback]);
      }
      
      setCurrentQuestion(data.nextQuestion);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.nextQuestion }]);
      setCurrentAnswer('');
    } catch (err) {
      console.error(err);
      alert('Error processing your answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl border-b border-slate-700 pb-4 mb-8 text-center">
        <h1 className="text-3xl font-bold text-teal-400 tracking-wide">AI Mock Interviewer</h1>
        <p className="text-slate-400 text-sm mt-1">Powered by Next.js & Groq</p>
      </header>

      {!started ? (
        <div className="w-full max-w-2xl bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Configure Your Interview</h2>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Paste Job Description / Targeted Role & Skills:
          </label>
          <textarea
            className="w-full h-40 p-3 rounded-lg bg-slate-900 text-slate-100 border border-slate-600 focus:outline-none focus:border-teal-500 resize-none mb-6"
            placeholder="e.g., Frontend Engineer with experience in React, Next.js, and Tailwind CSS..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Initializing AI Panel...' : 'Start Interview'}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl min-h-[450px]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              <div className="bg-slate-900 border-l-4 border-teal-500 p-4 rounded-r-lg">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">Interviewer Question</span>
                <p className="text-slate-200 text-base">{currentQuestion}</p>
              </div>
            </div>

            <div className="mt-auto">
              <label className="block text-sm font-medium text-slate-400 mb-2">Your Answer:</label>
              <textarea
                className="w-full h-28 p-3 rounded-lg bg-slate-900 text-slate-100 border border-slate-600 focus:outline-none focus:border-teal-500 resize-none mb-3"
                placeholder="Type your structured answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={submitAnswer}
                disabled={loading || !currentAnswer.trim()}
                className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col max-h-[500px]">
            <h3 className="text-md font-bold text-slate-300 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">
              Live AI Feedback
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 text-sm text-slate-300 pr-1">
              {feedbacks.length === 0 ? (
                <p className="text-slate-500 italic text-center mt-8">Feedback will appear as you answer questions.</p>
              ) : (
                feedbacks.map((fb, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded border border-slate-700">
                    <strong className="text-teal-400 block mb-1">Response {idx + 1}:</strong>
                    {fb}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}