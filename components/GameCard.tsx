import React, { useState, useEffect, useCallback } from 'react';
import { generateHint, generateNewWords } from '../services/geminiService';
import { Button } from './Button';
import { RefreshCw, Lightbulb, SkipForward, Send, Sparkles, Eye } from 'lucide-react';
import { HINT_COST, SKIP_COST, CORRECT_POINTS } from '../constants';
import { Difficulty } from '../types';

interface GameCardProps {
  word: string;
  difficulty: Difficulty;
  onCorrect: (points: number) => void;
  onSkip: () => void;
  isProcessing: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ word, difficulty, onCorrect, onSkip, isProcessing }) => {
  const [input, setInput] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error' | 'revealed'>('none');
  const [shake, setShake] = useState(false);

  // Scramble the word
  useEffect(() => {
    const shuffle = (str: string) => {
      const arr = str.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('');
    };

    let newScrambled = shuffle(word);
    // Ensure it's not same as original if length > 1
    while (newScrambled === word && word.length > 1) {
      newScrambled = shuffle(word);
    }
    setScrambled(newScrambled);
    setInput('');
    setHint(null);
    setFeedback('none');
  }, [word]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || feedback === 'revealed') return;

    if (input.toUpperCase() === word.toUpperCase()) {
      setFeedback('success');
      // Small delay for visual success state
      setTimeout(() => {
        onCorrect(CORRECT_POINTS - (hint ? HINT_COST : 0));
      }, 500);
    } else {
      setFeedback('error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput('');
    }
  };

  const handleHint = async () => {
    if (hint || loadingHint || feedback === 'revealed') return;
    setLoadingHint(true);
    const generatedHint = await generateHint(word, difficulty);
    setHint(generatedHint);
    setLoadingHint(false);
  };

  const handleSkipAction = () => {
    if (feedback === 'revealed') return;
    
    // Reveal the answer
    setFeedback('revealed');
    setInput(word);
    
    // Wait a moment so the user can see the answer, then proceed
    setTimeout(() => {
      onSkip();
    }, 2000); // Increased delay to ensure user reads the answer
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
        {/* Honeycomb pattern overlay */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" className="text-yellow-600">
                <path d="M25 0 L75 0 L100 43 L75 86 L25 86 L0 43 Z" />
            </svg>
        </div>

      <div className="text-center mb-8">
        <p className="text-yellow-600 font-bold uppercase tracking-widest text-sm mb-2">Unscramble the word</p>
        <div className="bg-yellow-100 rounded-xl p-6 border-b-4 border-yellow-300">
           <h2 className="text-4xl md:text-5xl font-black tracking-widest text-black break-all font-mono">
            {scrambled}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`relative transition-transform duration-100 ${shake ? 'translate-x-[-10px]' : ''} ${shake ? 'translate-x-[10px]' : ''}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={feedback === 'revealed' ? word : "Type your guess..."}
            disabled={feedback === 'revealed'}
            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-4 text-center text-xl font-bold outline-none transition-all
              ${feedback === 'error' ? 'border-red-500 text-red-600 bg-red-50' : ''}
              ${feedback === 'success' ? 'border-green-500 bg-green-50 text-green-600' : ''}
              ${feedback === 'revealed' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : ''}
              ${feedback === 'none' ? 'border-gray-200 focus:border-yellow-400 focus:bg-white text-black' : ''}
            `}
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="flex-1 text-lg" 
            variant="primary"
            disabled={feedback === 'revealed'}
          >
            Submit <Send size={18} />
          </Button>
        </div>
      </form>

      {/* Hints & Helpers */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={handleHint}
          disabled={!!hint || loadingHint || feedback === 'revealed'}
          className="flex items-center gap-1 text-sm font-bold text-yellow-700 hover:text-yellow-900 transition-colors disabled:opacity-50"
        >
          {loadingHint ? <Sparkles size={16} className="animate-spin" /> : <Lightbulb size={16} />}
          {hint ? 'Hint used (-5)' : 'Get Hint (-5)'}
        </button>

        <div className="w-px h-5 bg-yellow-300 self-center"></div>

        <button
          onClick={handleSkipAction}
          disabled={feedback === 'revealed'}
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          {feedback === 'revealed' ? (
            <>
              <Eye size={16} /> Revealed
            </>
          ) : (
            <>
              <SkipForward size={16} /> Skip (-10)
            </>
          )}
        </button>
      </div>

      {(hint || feedback === 'revealed') && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center animate-fade-in">
          <p className="text-yellow-800 text-sm italic">
            {feedback === 'revealed' ? (
              <span className="font-bold block">
                 The answer was: <span className="text-lg uppercase text-black not-italic ml-1">{word}</span>
              </span>
            ) : (
              <>
                <span className="font-bold">Colb Hint:</span> {hint}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};