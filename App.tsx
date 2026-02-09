import React, { useState, useEffect, useRef } from 'react';
import BACKGROUND_IMAGE_URL from './components/image/coLb.png';
import { INITIAL_WORDS, GAME_DURATION, DIFFICULTY_SETTINGS } from './constants';
import { GameState, GameStats, Difficulty } from './types';
import { Logo } from './components/Logo';
import { GameCard } from './components/GameCard';
import { Button } from './components/Button';
import { generateNewWords } from './services/geminiService';
import { Play, Trophy, Clock, RotateCcw, Sparkles, Check, Pause, BarChart3 } from 'lucide-react';

const AVAILABLE_CATEGORIES = ['Crypto', 'DeFi', 'Beekeeping', 'Honey', 'NFTs', 'Security', 'Trading'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [stats, setStats] = useState<GameStats>({ score: 0, streak: 0, bestStreak: 0 });
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [wordList, setWordList] = useState<string[]>(INITIAL_WORDS);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loadingWords, setLoadingWords] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Crypto', 'Honey']);
  
  // Timer Ref to clear intervals properly
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    setStats({ score: 0, streak: 0, bestStreak: 0 });
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].duration);
    // Shuffle words for new game
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    setWordList(shuffled);
    setCurrentWordIndex(0);
    setGameState(GameState.PLAYING);
  };

  const togglePause = () => {
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(GameState.GAME_OVER);
  };

  const handleCorrect = (points: number) => {
    // Apply difficulty multiplier to score
    const multiplier = DIFFICULTY_SETTINGS[difficulty].pointsMultiplier;
    const adjustedPoints = Math.round(points * multiplier);

    setStats((prev) => {
      const newStreak = prev.streak + 1;
      return {
        score: prev.score + adjustedPoints + (newStreak > 2 ? 5 : 0), // Bonus for streak
        streak: newStreak,
        bestStreak: Math.max(newStreak, prev.bestStreak),
      };
    });
    nextWord(true); // Add a small time bonus
  };

  const handleSkip = () => {
    setStats((prev) => ({
      ...prev,
      score: Math.max(0, prev.score - 10),
      streak: 0,
    }));
    nextWord(false);
  };

  const nextWord = (bonusTime: boolean) => {
    if (bonusTime) {
      setTimeLeft((t) => t + 3); // 3 seconds bonus
    }
    
    // If we are running low on words, try to fetch more in background, 
    // but for now just loop or finish.
    if (currentWordIndex >= wordList.length - 1) {
       // Loop back or fetch more? Let's reshuffle existing for infinite play until time runs out
       const reshuffled = [...wordList].sort(() => Math.random() - 0.5);
       setWordList(reshuffled);
       setCurrentWordIndex(0);
    } else {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleGenerateWords = async () => {
    if (selectedCategories.length === 0) {
      setStatusMessage("Please select at least one category.");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setLoadingWords(true);
    setStatusMessage(null);
    try {
      const promptModifier = DIFFICULTY_SETTINGS[difficulty].promptModifier;
      const newWords = await generateNewWords(10, selectedCategories, promptModifier);
      
      // Filter out words that already exist
      const uniqueNewWords = newWords.filter(w => !wordList.includes(w));
      
      if (uniqueNewWords.length > 0) {
          setWordList(prev => [...prev, ...uniqueNewWords]);
          
          const catStr = selectedCategories.length > 3 
            ? `${selectedCategories.slice(0, 2).join(', ')}...` 
            : selectedCategories.join(', ');
            
          setStatusMessage(`✨ Added ${uniqueNewWords.length} ${DIFFICULTY_SETTINGS[difficulty].label} words for: ${catStr}`);
      } else if (newWords.length > 0) {
          setStatusMessage("No new unique words found.");
      } else {
          setStatusMessage("Could not generate words. Try again.");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("Error connecting to AI.");
    } finally {
      setLoadingWords(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }

  return (
    <div className="min-h-screen relative font-sans overflow-hidden text-gray-900 selection:bg-yellow-400 selection:text-black">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
      />
      <div className="absolute inset-0 bg-yellow-400/30 backdrop-blur-sm z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/20 z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <header className="w-full flex flex-col items-center mb-6 animate-fade-in-down">
          <Logo className="mb-4 scale-90 md:scale-100" />
        </header>

        {/* Game State Views */}
        <main className="w-full flex-1 flex flex-col items-center justify-center">
          
          {/* MENU STATE */}
          {gameState === GameState.MENU && (
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border-b-8 border-yellow-400 text-center max-w-lg w-full animate-pop-in">
              <h2 className="text-3xl font-black mb-2">Ready to Scramble?</h2>
              
              <div className="space-y-6 mt-6">
                
                {/* Difficulty Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                        ${difficulty === level 
                          ? 'bg-yellow-100 border-yellow-500 text-yellow-900 shadow-md scale-105' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-yellow-300'
                        }
                      `}
                    >
                      <span className="font-black text-sm">{DIFFICULTY_SETTINGS[level].label}</span>
                      <span className="text-[10px] font-bold mt-1 opacity-80">{DIFFICULTY_SETTINGS[level].duration}s</span>
                    </button>
                  ))}
                </div>

                <Button onClick={startGame} className="w-full text-lg py-4 shadow-yellow-400/50 shadow-lg" variant="primary">
                  <Play fill="currentColor" /> Start Game
                </Button>
                
                {/* AI Config */}
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">Customize Word List</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 justify-start text-center">
                    {AVAILABLE_CATEGORIES.map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border
                            flex items-center gap-1.5
                            ${isSelected 
                              ? 'bg-yellow-400 text-black border-yellow-500 shadow-sm' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-yellow-300'
                            }
                          `}
                        >
                          {cat}
                          {isSelected && <Check size={10} strokeWidth={4} />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative">
                    <Button 
                        onClick={handleGenerateWords} 
                        disabled={loadingWords}
                        className="w-full text-sm py-2.5" 
                        variant="secondary"
                    >
                        <Sparkles size={16} className={loadingWords ? "animate-pulse" : ""} /> 
                        {loadingWords ? 'Generating Words...' : 'Generate & Add Words'}
                    </Button>
                    
                    {statusMessage && (
                      <div className="absolute top-full left-0 right-0 mt-2 text-center text-xs font-bold text-yellow-800 animate-fade-in-down bg-yellow-100 py-1.5 rounded-lg border border-yellow-200 z-20 shadow-sm">
                        {statusMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-center gap-4 text-xs text-gray-500 font-bold">
                    <span className="flex items-center gap-1"><BarChart3 size={12} className="text-yellow-500"/> {DIFFICULTY_SETTINGS[difficulty].description}</span>
                    <span className="flex items-center gap-1"><Sparkles size={12} className="text-yellow-500"/> Colb Powered</span>
                </div>
              </div>
            </div>
          )}

          {/* PLAYING / PAUSED STATE */}
          {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
            <div className="w-full max-w-md animate-fade-in relative">
              {/* HUD */}
              <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-2 bg-black/80 text-yellow-400 px-4 py-2 rounded-full font-bold shadow-lg">
                    <Trophy size={18} />
                    <span>{stats.score}</span>
                </div>

                <div className="flex gap-2 z-30">
                  <button 
                      onClick={togglePause}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-black shadow-lg hover:bg-yellow-400 transition-all active:scale-95"
                      aria-label={gameState === GameState.PAUSED ? "Resume Game" : "Pause Game"}
                  >
                      {gameState === GameState.PAUSED ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                  </button>
                  <button 
                      onClick={startGame}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-black shadow-lg hover:bg-red-500 hover:text-white transition-all active:scale-95"
                      aria-label="Reset Game"
                  >
                      <RotateCcw size={20} />
                  </button>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-colors ${timeLeft < 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-black'}`}>
                    <Clock size={18} />
                    <span>{timeLeft}s</span>
                </div>
              </div>

              <div className="relative">
                <GameCard 
                  word={wordList[currentWordIndex]} 
                  difficulty={difficulty}
                  onCorrect={handleCorrect}
                  onSkip={handleSkip}
                  isProcessing={false}
                />

                {/* PAUSED OVERLAY */}
                {gameState === GameState.PAUSED && (
                  <div className="absolute inset-0 bg-yellow-500/20 backdrop-blur-md rounded-3xl z-50 flex flex-col items-center justify-center animate-fade-in border-4 border-yellow-400">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl text-center transform scale-110">
                      <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">Paused</h2>
                      <div className="text-gray-500 font-bold mb-4">{DIFFICULTY_SETTINGS[difficulty].label} Difficulty</div>
                      <Button onClick={togglePause} variant="primary" className="w-full">
                        <Play fill="currentColor" size={20} /> Resume
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-6 text-white font-bold drop-shadow-md">
                 <span className="bg-black/30 px-3 py-1 rounded-full text-sm mr-2">{DIFFICULTY_SETTINGS[difficulty].label}</span>
                 Streak: <span className="text-yellow-300">{stats.streak} 🔥</span>
              </div>
            </div>
          )}

          {/* GAME OVER STATE */}
          {gameState === GameState.GAME_OVER && (
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border-b-8 border-yellow-400 text-center max-w-lg w-full animate-pop-in">
              <div className="mb-6">
                <Trophy size={64} className="mx-auto text-yellow-500 mb-4 drop-shadow-lg" />
                <h2 className="text-4xl font-black mb-2 text-black">Time's Up!</h2>
                
                <div className="mt-4 mb-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">You missed the word</p>
                    <p className="text-3xl font-black text-red-600 tracking-wider">{wordList[currentWordIndex]}</p>
                </div>

                <p className="text-gray-500 font-bold uppercase tracking-wider mt-6">Final Score</p>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200">
                 <span className="text-6xl font-black text-black block mb-2">{stats.score}</span>
                 <span className="flex items-center justify-center gap-2 text-sm text-yellow-700 font-bold">
                    <span>Best Streak: {stats.bestStreak}</span>
                    <span>•</span>
                    <span>{DIFFICULTY_SETTINGS[difficulty].label}</span>
                 </span>
              </div>
              
              <div className="space-y-3">
                <Button onClick={startGame} className="w-full text-lg" variant="primary">
                  <RotateCcw /> Play Again
                </Button>
                <Button onClick={() => setGameState(GameState.MENU)} className="w-full" variant="ghost">
                  Back to Menu
                </Button>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-8 text-center text-white/80 text-xs font-medium">
            <p>Built by Buythedip • Colb Finance </p>
        </footer>
      </div>
    </div>
  );
};

export default App;