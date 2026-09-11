import React, { useState, useEffect } from 'react';
import questionsData from '../assets/questions.json';

export default function TalonFaible() {
  const [gameState, setGameState] = useState('lobby'); 
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [timerLimit, setTimerLimit] = useState(5);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  
  // NOUVEAU : Gestion aléatoire et Balle de match
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [playedIds, setPlayedIds] = useState([]);
  const [matchPointTriggered, setMatchPointTriggered] = useState(false);
  
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, gameState]);

  // Fonction pour piocher une question aléatoire
  const pickRandomQuestion = (currentPlayedIds = playedIds) => {
    const availableQuestions = questionsData.filter(q => !currentPlayedIds.includes(q.id));
    
    // Si on a fait le tour, on réinitialise l'historique
    if (availableQuestions.length === 0) {
      const randomQ = questionsData[Math.floor(Math.random() * questionsData.length)];
      setCurrentQuestion(randomQ);
      setPlayedIds([randomQ.id]);
      return;
    }

    const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQ);
    setPlayedIds([...currentPlayedIds, randomQ.id]);
  };

  const addPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim() !== '') {
      setPlayers([...players, { name: newPlayerName.trim(), lives: 2 }]);
      setNewPlayerName('');
    }
  };

  const startGame = () => {
    if (players.length > 0) {
      pickRandomQuestion([]);
      setGameState('ready');
      setTimeLeft(timerLimit);
    }
  };

  const nextTurn = (isCorrect) => {
    const updatedPlayers = players.map((player, index) => {
      if (index === currentPlayerIndex && !isCorrect) {
        return { ...player, lives: player.lives - 1 };
      }
      return player;
    });
    
    const activePlayers = updatedPlayers.filter(p => p.lives > 0);
    setPlayers(updatedPlayers);
    
    if (activePlayers.length <= 1) {
      setGameState('gameover');
      return;
    }

    let nextIndex = (currentPlayerIndex + 1) % updatedPlayers.length;
    while (updatedPlayers[nextIndex].lives <= 0) {
      nextIndex = (nextIndex + 1) % updatedPlayers.length;
    }
    setCurrentPlayerIndex(nextIndex);

    // VÉRIFICATION DE LA BALLE DE MATCH
    const isMatchPoint = activePlayers.length === 2 && activePlayers.some(p => p.lives === 1);

    if (!isCorrect) {
      // Si mauvaise réponse, on change de question et on met en pause
      if (isMatchPoint && !matchPointTriggered) {
        setCurrentQuestion({
          question: "Citez-moi des bonnes réponses des questions précédentes !",
          indication_mj: "BALLE DE MATCH ! Acceptez tout ce qui a été validé plus tôt."
        });
        setMatchPointTriggered(true);
      } else {
        pickRandomQuestion();
      }
      setGameState('ready');
    }
    
    setTimeLeft(timerLimit);
  };

  const skipQuestion = () => {
    pickRandomQuestion();
    setTimeLeft(timerLimit);
    setGameState('ready');
  };

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-amber-400 p-6 flex flex-col items-center justify-center font-sans">
        <div className="border-4 border-amber-500 p-8 rounded-xl bg-slate-900 shadow-2xl max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-8 uppercase tracking-widest" style={{ fontFamily: 'Impact, sans-serif' }}>
            Le Talon Faible
          </h1>
          
          <form onSubmit={addPlayer} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newPlayerName} 
              onChange={(e) => setNewPlayerName(e.target.value)} 
              placeholder="Prénom..."
              className="flex-1 px-4 py-2 bg-slate-800 border-2 border-amber-600 rounded text-amber-200 focus:outline-none"
            />
            <button type="submit" className="bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded">
              Ajouter
            </button>
          </form>

          <ul className="mb-6 space-y-2">
            {players.map((p, i) => (
              <li key={i} className="text-xl text-center bg-slate-800 py-2 rounded border border-amber-800">
                {p.name}
              </li>
            ))}
          </ul>

          <div className="mb-8">
            <label className="block text-center mb-2">Temps de réponse : {timerLimit}s</label>
            <input 
              type="range" min="3" max="15" value={timerLimit} 
              onChange={(e) => setTimerLimit(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button 
            onClick={startGame}
            className="w-full py-4 text-2xl font-bold bg-amber-500 text-slate-900 rounded shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          >
            LANCER LE JEU
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const winner = players.find(p => p.lives > 0);
    return (
      <div className="min-h-screen bg-slate-950 text-amber-400 flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold mb-4 text-center">FIN DU JEU</h1>
        <p className="text-3xl text-white mb-8 text-center">Survivante : <br/><span className="text-amber-500 text-6xl uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>{winner ? winner.name : 'Aucune'}</span></p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-amber-500 text-slate-900 rounded font-bold text-2xl">
          Rejouer
        </button>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-10 px-4">
      
      <div className="text-center mb-6 mt-4">
        <h2 className={`text-6xl font-black uppercase tracking-wider shadow-sm drop-shadow-lg transition-colors ${gameState === 'ready' ? 'text-amber-200' : 'text-white'}`} style={{ fontFamily: 'Impact, sans-serif' }}>
          {currentPlayer.name}
        </h2>
        <div className="flex justify-center gap-4 mt-4 h-12">
          {[...Array(currentPlayer.lives)].map((_, i) => (
            <span key={i} className="text-4xl text-amber-500 drop-shadow-md animate-in zoom-in">
              👠
            </span>
          ))}
        </div>
      </div>

      <div className={`bg-slate-900 border-4 ${gameState === 'ready' ? 'border-slate-500' : (matchPointTriggered ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'border-amber-500')} rounded-lg p-8 w-full max-w-2xl text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-8 relative overflow-hidden flex flex-col items-center transition-all`}>
        
        {timeLeft === 0 && gameState === 'playing' && <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>}
        
        <p className={`text-3xl font-semibold mb-6 leading-tight relative z-10 ${matchPointTriggered ? 'text-red-400' : 'text-amber-50'}`}>
          "{currentQuestion?.question}"
        </p>
        
        <div className="inline-block px-4 py-2 border border-slate-700 bg-slate-950 rounded text-slate-400 text-sm relative z-10 mb-4">
          <span className="font-bold text-amber-600 uppercase text-xs block mb-1">Indication MJ</span>
          {currentQuestion?.indication_mj}
        </div>

        <button 
          onClick={skipQuestion}
          className="text-slate-500 hover:text-amber-400 text-sm font-bold uppercase transition-colors relative z-10 border border-slate-700 hover:border-amber-400 px-3 py-1 rounded-full"
        >
          ⏭️ Changer de question
        </button>
      </div>

      <div className="mt-auto pb-6 w-full flex flex-col items-center justify-center min-h-[160px]">
        {gameState === 'ready' ? (
          <button 
            onClick={() => setGameState('playing')}
            className="px-12 py-6 bg-amber-500 text-slate-900 font-black text-5xl rounded-[2rem] border-4 border-amber-600 shadow-[0_10px_0_rgb(180,83,9)] active:shadow-none active:translate-y-2 uppercase tracking-widest transition-all hover:bg-amber-400"
            style={{ fontFamily: 'Impact, sans-serif' }}
          >
            GO !
          </button>
        ) : (
          <>
            <div className={`text-7xl font-black mb-6 ${timeLeft <= 2 ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} style={{ fontFamily: 'Impact, sans-serif' }}>
              {timeLeft}
            </div>
            
            <div className="flex gap-10">
              <button 
                onClick={() => nextTurn(false)}
                className="w-28 h-28 bg-red-600 rounded-full border-4 border-red-800 shadow-[0_10px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2 flex items-center justify-center text-5xl transition-all"
              >
                ❌
              </button>
              <button 
                onClick={() => nextTurn(true)}
                className="w-28 h-28 bg-emerald-500 rounded-full border-4 border-emerald-700 shadow-[0_10px_0_rgb(4,120,87)] active:shadow-none active:translate-y-2 flex items-center justify-center text-5xl transition-all"
              >
                ✅
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}