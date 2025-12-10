import { useState, useEffect } from 'react';
import { Send, Cpu, ShieldAlert, ShieldCheck, Scan, Terminal as TerminalIcon, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { API_URL } from '../config';

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

const SCAN_STEPS = [
  "INITIALIZING NEURAL LINK...",
  "PARSING SEMANTIC VECTORS...",
  "CROSS-REFERENCING KNOWLEDGE BASE...",
  "DETECTING HALLUCINATIONS...",
  "CALCULATING TRUST SCORE...",
  "GENERATING AUDIT REPORT..."
];

// Verification Console Component
export function VerificationConsole() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanLog, setScanLog] = useState<string[]>([]);

  // Simulate scanning logs
  useEffect(() => {
    if (loading) {
      setScanLog([]);
      let step = 0;
      const interval = setInterval(() => {
        if (step < SCAN_STEPS.length) {
          setScanLog(prev => [...prev, SCAN_STEPS[step]]);
          step++;
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleVerify = async () => {
    if (!question || !answer) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch(`${API_URL}/api/v1/verify`, {
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
      
      // Artificial delay to show off the cool animation
      await new Promise(r => setTimeout(r, 1500));
      
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ error: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderHighlightedText = (text: string, unsupportedClaims: string[] = []) => {
    if (!unsupportedClaims.length) return <span className="text-green-400/90">{text}</span>;

    // Simple highlighting logic (can be improved with more complex matching)
    // This is a simplified visualizer. In a real app, we'd map indices.
    // Here we just check if the claim exists in the text to highlight it.
    
    return (
      <div className="relative leading-relaxed">
        {unsupportedClaims.map((claim, i) => (
          <div key={i} className="mb-2">
             <span className="bg-red-500/20 text-red-400 border-b border-red-500/50 px-1 rounded animate-pulse">
               "{claim}"
             </span>
          </div>
        ))}
        <div className="text-xs text-gray-500 mt-2 border-t border-white/10 pt-2">
          * Detected anomalies highlighted above. Remaining text verified against context.
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-xl md:rounded-2xl p-1 flex flex-col h-full relative overflow-hidden group">
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 left-0 w-2 h-2 md:w-3 md:h-3 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-2 h-2 md:w-3 md:h-3 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
      
      <div className="p-3 md:p-4 flex flex-col h-full relative z-10 overflow-hidden">
        <div className="flex items-center justify-between mb-3 md:mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <Cpu size={18} className={cn(loading && "animate-spin", "md:w-5 md:h-5")} />
            <h3 className="font-mono font-bold tracking-wider text-xs md:text-sm">VERIFICATION CONSOLE</h3>
          </div>
          {result && (
            <button 
              onClick={() => setResult(null)}
              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw size={12} /> RESET
            </button>
          )}
        </div>

        {!result && !loading && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => { 
                  setQuestion(ex.question); 
                  setAnswer(ex.answer); 
                  setContext(ex.context); 
                }}
                className="text-[10px] md:text-xs font-mono bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded px-2 md:px-3 py-1 md:py-1.5 whitespace-nowrap transition-all text-gray-400 hover:text-primary flex items-center gap-1 md:gap-2"
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative min-h-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary/20 rounded-full animate-spin-slow" />
                  <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  <Scan className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
                </div>
                <div className="w-full max-w-xs bg-black/50 rounded border border-primary/20 p-3 font-mono text-[10px] md:text-xs space-y-1 h-24 md:h-28 overflow-hidden flex flex-col-reverse">
                  {scanLog.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-primary/80"
                    >
                      {`> ${log}`}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3 md:space-y-4"
              >
                {/* Score Header */}
                <div className="flex items-center justify-between bg-white/5 p-3 md:p-4 rounded-lg md:rounded-xl border border-white/10">
                  <div>
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-1">Trust Score</div>
                    <div className={cn(
                      "text-2xl md:text-3xl font-bold font-mono flex items-center gap-2",
                      result.trust_score > 0.7 ? "text-green-400" : "text-red-400"
                    )}>
                      {(result.trust_score * 100).toFixed(0)}%
                      {result.trust_score > 0.7 ? <ShieldCheck size={20} className="md:w-6 md:h-6" /> : <ShieldAlert size={20} className="md:w-6 md:h-6" />}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-1">Action</div>
                    <div className={cn(
                      "px-2 md:px-3 py-1 rounded text-xs md:text-sm font-bold inline-block",
                      result.action === 'APPROVE' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {result.action}
                    </div>
                  </div>
                </div>

                {/* Analysis View */}
                <div className="space-y-3">
                  <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                    <div className="bg-white/5 px-3 py-1.5 md:py-2 border-b border-white/10 flex items-center gap-2">
                      <Scan size={12} className="text-primary md:w-3.5 md:h-3.5" />
                      <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase">Semantic Analysis</span>
                    </div>
                    <div className="p-3 font-mono text-xs md:text-sm">
                      {result.tests?.grounding?.pass ? (
                        <div className="text-green-400/90 flex gap-2">
                          <Check size={16} className="mt-0.5 shrink-0" />
                          {answer}
                        </div>
                      ) : (
                        renderHighlightedText(answer, result.tests?.grounding?.unsupported_claims)
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className={cn(
                      "p-2 md:p-3 rounded-lg border bg-opacity-10",
                      result.tests?.grounding?.pass 
                        ? "bg-green-500 border-green-500/20" 
                        : "bg-red-500 border-red-500/20"
                    )}>
                      <div className="text-[10px] md:text-xs text-gray-400 uppercase mb-1">Grounding</div>
                      <div className={cn("text-sm md:text-base font-bold", result.tests?.grounding?.pass ? "text-green-400" : "text-red-400")}>
                        {result.tests?.grounding?.pass ? "VERIFIED" : "FAILED"}
                      </div>
                    </div>
                    <div className={cn(
                      "p-2 md:p-3 rounded-lg border bg-opacity-10",
                      result.tests?.citation?.pass 
                        ? "bg-green-500 border-green-500/20" 
                        : "bg-yellow-500 border-yellow-500/20"
                    )}>
                      <div className="text-[10px] md:text-xs text-gray-400 uppercase mb-1">Citations</div>
                      <div className={cn("text-sm md:text-base font-bold", result.tests?.citation?.pass ? "text-green-400" : "text-yellow-400")}>
                        {result.tests?.citation?.pass ? "VALID" : "MISSING"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-mono text-gray-500 uppercase flex items-center gap-1.5">
                    <TerminalIcon size={10} className="md:w-3 md:h-3" /> User Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Input query..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 md:p-3 text-xs md:text-sm text-gray-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none h-12 md:h-14 font-mono placeholder:text-gray-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-mono text-gray-500 uppercase flex items-center gap-1.5">
                    <TerminalIcon size={10} className="md:w-3 md:h-3" /> Agent Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Input agent response..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 md:p-3 text-xs md:text-sm text-gray-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none h-16 md:h-20 font-mono placeholder:text-gray-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-mono text-gray-500 uppercase flex items-center gap-1.5">
                    <TerminalIcon size={10} className="md:w-3 md:h-3" /> Context Source
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Input grounding data..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 md:p-3 text-xs md:text-sm text-gray-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none h-14 md:h-16 font-mono placeholder:text-gray-700"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!result && !loading && (
          <button
            onClick={handleVerify}
            disabled={!question || !answer}
            className="mt-3 w-full bg-primary hover:bg-primary/90 border-2 border-primary text-black font-mono font-bold py-2.5 md:py-3 px-3 md:px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 group relative overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 flex-shrink-0 text-sm md:text-base"
            style={{ zIndex: 10 }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Send size={14} className="group-hover:translate-x-1 transition-transform relative z-10 md:w-4 md:h-4" />
            <span className="relative z-10 tracking-wider">INITIATE SCAN</span>
          </button>
        )}
      </div>
    </div>
  );
}