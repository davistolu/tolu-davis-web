import React, { useState, useEffect, useRef } from 'react';
import { terminalSound } from '../utils/terminalSound';
import { RotateCcw, Zap, CheckCircle2 } from 'lucide-react';

const CODE_SNIPPETS = [
  'const useTelemetry = (id: string) => { return useQuery(["telemetry", id], fetchStats); };',
  'export async function deployContract(provider: Provider, abi: ABI): Promise<TransactionReceipt> {',
  'const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);',
  'const res = await fetch("/api/v1/auth/jwt", { headers: { "Authorization": `Bearer ${token}` } });',
];

const TypingTest: React.FC = () => {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const targetText = CODE_SNIPPETS[snippetIndex];
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetTest = () => {
    setSnippetIndex((prev) => (prev + 1) % CODE_SNIPPETS.length);
    setTyped('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    terminalSound.playSuccess();
    inputRef.current?.focus();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    terminalSound.playKeyClick();

    if (!startTime) {
      setStartTime(Date.now());
    }

    setTyped(val);

    // Calculate Accuracy
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== targetText[i]) errors++;
    }
    const acc = Math.max(0, Math.round(((val.length - errors) / Math.max(1, val.length)) * 100));
    setAccuracy(acc);

    // Calculate WPM
    if (startTime) {
      const elapsedMins = (Date.now() - startTime) / 60000;
      if (elapsedMins > 0) {
        const words = val.length / 5;
        setWpm(Math.round(words / elapsedMins));
      }
    }

    // Check Completion
    if (val === targetText) {
      setIsCompleted(true);
      terminalSound.playSuccess();
    }
  };

  return (
    <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-4 font-mono text-xs max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#18181b] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] font-bold">⚡ CODE_SPEED_BENCHMARK</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">WPM: <strong className="text-white">{wpm}</strong></span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">Accuracy: <strong className="text-[#4ade80]">{accuracy}%</strong></span>
        </div>
        <button
          onClick={resetTest}
          className="p-1 hover:bg-[#18181b] text-zinc-400 hover:text-white rounded"
          title="New Snippet"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Target Code Display with syntax highlight */}
      <div className="p-3 bg-[#050507] border border-[#18181b] rounded leading-relaxed select-none">
        {targetText.split('').map((char, i) => {
          let color = 'text-zinc-500';
          if (i < typed.length) {
            color = typed[i] === char ? 'text-[#4ade80] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/20';
          } else if (i === typed.length) {
            color = 'text-white border-b-2 border-[#38bdf8]';
          }
          return (
            <span key={i} className={color}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Interactive Input */}
      {!isCompleted ? (
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 block">Type the snippet above:</label>
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleInput}
            autoFocus
            placeholder="start typing code here..."
            className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] text-[#38bdf8] rounded text-xs font-mono outline-none focus:border-[#38bdf8]"
          />
        </div>
      ) : (
        <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded text-center space-y-2">
          <p className="text-[#4ade80] font-bold text-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> BENCHMARK COMPLETE!
          </p>
          <p className="text-xs text-zinc-300">
            Speed: <strong className="text-white">{wpm} WPM</strong> · Accuracy: <strong className="text-white">{accuracy}%</strong>
          </p>
          <button
            onClick={resetTest}
            className="px-4 py-1.5 bg-[#22c55e] text-black font-bold rounded text-xs hover:bg-[#16a34a] transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Next Snippet
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
