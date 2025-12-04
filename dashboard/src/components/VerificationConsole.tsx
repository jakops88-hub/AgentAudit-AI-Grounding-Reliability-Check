import { useState } from 'react';
import { Send, Cpu, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const EXAMPLES = [
  {
    label: "✅ Valid Fact",
    question: "What is the capital of France?",
    answer: "The capital of France is Paris.",
    context: "Paris is the capital and most populous city of France."
  },
  {
    label: "❌ Hallucination",
    question: "Who founded Apple?",
    answer: "Elon Musk founded Apple in 1976.",
    context: "Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne."
  },
  {
    label: "⚠️ Contradiction",
    question: "At what temperature does water boil?",
    answer: "Water boils at 10 degrees Celsius.",
    context: "The boiling point of water is 100 degrees Celsius at standard atmospheric pressure."
  }
];

export function VerificationConsole() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!question || !answer) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch('https://agent-audit-ai-grounding-reliabilit.vercel.app/api/v1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-key-123'
        },
        body: JSON.stringify({
          question: question,
          answer: answer,
          context: context || "General knowledge"
        })
      });
      
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ error: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-primary">
          <Cpu size={20} />
          <h3 className="font-mono font-bold tracking-wider">VERIFICATION CONSOLE</h3>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { 
              setQuestion(ex.question); 
              setAnswer(ex.answer); 
              setContext(ex.context); 
            }}
            className="text-xs font-mono bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded px-3 py-1.5 whitespace-nowrap transition-all text-gray-400 hover:text-primary flex items-center gap-2"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-500 uppercase">User Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What did the user ask?"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none h-16 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-500 uppercase">Agent Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="What did the AI respond?"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none h-24 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-500 uppercase">Context (Source Material)</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide grounding context..."
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none h-20 font-mono"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || !question || !answer}
          className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary font-mono font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ANALYZING...
            </>
          ) : (
            <>
              <Send size={16} className="group-hover:translate-x-1 transition-transform" />
              EXECUTE VERIFICATION
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            {result.error ? (
              <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <AlertCircle size={20} />
                <span className="font-mono text-sm">ERROR: {result.error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.trust_score > 0.7 ? (
                      <ShieldCheck className="text-green-500" size={24} />
                    ) : (
                      <ShieldAlert className="text-red-500" size={24} />
                    )}
                    <span className={cn(
                      "text-xl font-bold font-mono",
                      result.trust_score > 0.7 ? "text-green-500" : "text-red-500"
                    )}>
                      {(result.trust_score * 100).toFixed(0)}% TRUST
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {result.latency_ms || 0}ms
                  </span>
                </div>

                <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 uppercase">Action</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      result.action === 'APPROVE' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {result.action}
                    </span>
                  </div>
                  
                  {/* Detailed Breakdown */}
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Grounding Check</span>
                      <span className={result.tests?.grounding?.pass ? "text-green-400" : "text-red-400"}>
                        {result.tests?.grounding?.pass ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    {!result.tests?.grounding?.pass && result.tests?.grounding?.unsupported_claims?.length > 0 && (
                       <div className="text-xs text-red-400/80 pl-2 border-l border-red-500/20">
                         Unsupported: {result.tests.grounding.unsupported_claims.join(', ')}
                       </div>
                    )}

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Citation Check</span>
                      <span className={result.tests?.citation?.pass ? "text-green-400" : "text-red-400"}>
                        {result.tests?.citation?.pass ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  </div>

                  {result.retry_suggestion && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-yellow-500/80 italic">
                        Suggestion: {result.retry_suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}