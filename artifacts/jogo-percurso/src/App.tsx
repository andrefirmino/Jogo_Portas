import { useState, useCallback } from "react";

const TOTAL_LEVELS = 10;

const QUESTIONS = [
  {
    question: "Qual a capital do Brasil?",
    options: ["São Paulo", "Brasília", "Rio de Janeiro"],
    correct: 1,
  },
  {
    question: "Quanto é 7 × 8?",
    options: ["54", "56", "58"],
    correct: 1,
  },
  {
    question: "Qual planeta é o mais próximo do Sol?",
    options: ["Vênus", "Marte", "Mercúrio"],
    correct: 2,
  },
  {
    question: "Quem escreveu 'Dom Casmurro'?",
    options: ["José de Alencar", "Machado de Assis", "Clarice Lispector"],
    correct: 1,
  },
  {
    question: "Quantos lados tem um hexágono?",
    options: ["5", "7", "6"],
    correct: 2,
  },
  {
    question: "Qual o maior oceano do mundo?",
    options: ["Atlântico", "Índico", "Pacífico"],
    correct: 2,
  },
  {
    question: "Em que ano o Brasil foi descoberto?",
    options: ["1500", "1492", "1510"],
    correct: 0,
  },
  {
    question: "Qual o elemento químico do ouro?",
    options: ["Ag", "Fe", "Au"],
    correct: 2,
  },
  {
    question: "Quantos estados tem o Brasil?",
    options: ["26", "27", "25"],
    correct: 1,
  },
  {
    question: "Qual destes é um mamífero?",
    options: ["Tubarão", "Golfinho", "Piranha"],
    correct: 1,
  },
  {
    question: "Qual a cor resultante de azul + amarelo?",
    options: ["Roxo", "Laranja", "Verde"],
    correct: 2,
  },
  {
    question: "Quantos minutos tem uma hora?",
    options: ["50", "60", "70"],
    correct: 1,
  },
  {
    question: "Qual o rio mais longo do mundo?",
    options: ["Nilo", "Amazonas", "Yangtzé"],
    correct: 0,
  },
  {
    question: "Quem pintou a Mona Lisa?",
    options: ["Michelangelo", "Rafael", "Leonardo da Vinci"],
    correct: 2,
  },
  {
    question: "Qual o idioma oficial de Portugal?",
    options: ["Espanhol", "Português", "Francês"],
    correct: 1,
  },
  {
    question: "Quanto é a raiz quadrada de 144?",
    options: ["14", "12", "11"],
    correct: 1,
  },
  {
    question: "Qual o animal mais rápido do mundo?",
    options: ["Leão", "Guepardo", "Leopardo"],
    correct: 1,
  },
  {
    question: "Qual o maior país do mundo em área?",
    options: ["China", "Canadá", "Rússia"],
    correct: 2,
  },
  {
    question: "Quantos dias tem um ano bissexto?",
    options: ["365", "367", "366"],
    correct: 2,
  },
  {
    question: "Qual o menor planeta do sistema solar?",
    options: ["Marte", "Plutão", "Mercúrio"],
    correct: 2,
  },
  {
    question: "Qual instrumento tem teclas preto e branco?",
    options: ["Violão", "Piano", "Flauta"],
    correct: 1,
  },
  {
    question: "Quanto é 15% de 200?",
    options: ["25", "35", "30"],
    correct: 2,
  },
  {
    question: "Qual a fórmula química da água?",
    options: ["CO2", "H2O", "O2"],
    correct: 1,
  },
  {
    question: "Qual animal é símbolo da WWF?",
    options: ["Elefante", "Urso Polar", "Panda"],
    correct: 2,
  },
  {
    question: "Quantas cordas tem um violão clássico?",
    options: ["5", "6", "7"],
    correct: 1,
  },
  {
    question: "Qual o continente mais populoso?",
    options: ["África", "América", "Ásia"],
    correct: 2,
  },
  {
    question: "O que estuda a Astronomia?",
    options: ["Rochas", "Astros e universo", "Oceanos"],
    correct: 1,
  },
  {
    question: "Qual é a capital da França?",
    options: ["Lyon", "Paris", "Marselha"],
    correct: 1,
  },
  {
    question: "Quantos zeros tem um milhão?",
    options: ["5", "7", "6"],
    correct: 2,
  },
  {
    question: "Qual destes é um gás nobre?",
    options: ["Oxigênio", "Nitrogênio", "Hélio"],
    correct: 2,
  },
];

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seededRandom(seed: number): number {
  const s = (seed * 1664525 + 1013904223) & 0xffffffff;
  return Math.abs(s) / 0xffffffff;
}

function generatePlayerPath(playerIndex: number, playerName: string): QuestionData[] {
  const nameSeed = playerName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = nameSeed * 31 + playerIndex * 997;
  const shuffled = shuffleArray(QUESTIONS, seed);
  const picked = shuffled.slice(0, TOTAL_LEVELS);

  return picked.map((q, i) => {
    const optSeed = seed + i * 7919;
    const shuffledOpts = shuffleArray(q.options.map((o, idx) => ({ text: o, isCorrect: idx === q.correct })), optSeed);
    return {
      question: q.question,
      options: shuffledOpts.map((o) => o.text),
      correctIndex: shuffledOpts.findIndex((o) => o.isCorrect),
    };
  });
}

interface QuestionData {
  question: string;
  options: string[];
  correctIndex: number;
}

interface PlayerResult {
  name: string;
  score: number;
  answers: ("correct" | "wrong")[];
  finished: boolean;
}

type GamePhase = "setup" | "playing" | "results";

const LEVEL_COLORS = [
  "from-purple-500 to-indigo-500",
  "from-indigo-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-cyan-500 to-teal-500",
  "from-teal-500 to-green-500",
  "from-green-500 to-lime-500",
  "from-lime-500 to-yellow-500",
  "from-yellow-500 to-orange-500",
  "from-orange-500 to-red-500",
  "from-red-500 to-pink-500",
];

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [players, setPlayers] = useState<{ name: string; path: QuestionData[] }[]>([]);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<("correct" | "wrong")[]>([]);
  const [currentScore, setCurrentScore] = useState(0);

  const addPlayer = () => setPlayerNames((p) => [...p, ""]);
  const removePlayer = (i: number) => setPlayerNames((p) => p.filter((_, idx) => idx !== i));
  const updatePlayer = (i: number, val: string) =>
    setPlayerNames((p) => p.map((n, idx) => (idx === i ? val : n)));

  const startGame = () => {
    const validNames = playerNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) return;
    const playerList = validNames.map((name, i) => ({
      name,
      path: generatePlayerPath(i, name),
    }));
    setPlayers(playerList);
    setResults([]);
    setCurrentPlayerIdx(0);
    setCurrentLevel(0);
    setCurrentAnswers([]);
    setCurrentScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setPhase("playing");
  };

  const currentPlayer = players[currentPlayerIdx];
  const currentQuestion = currentPlayer?.path[currentLevel];

  const handleOptionClick = useCallback(
    (optIdx: number) => {
      if (showResult || selectedOption !== null) return;
      setSelectedOption(optIdx);
      setShowResult(true);
    },
    [showResult, selectedOption]
  );

  const handleNext = () => {
    const isCorrect = selectedOption === currentQuestion?.correctIndex;
    const newAnswers = [...currentAnswers, isCorrect ? "correct" : "wrong"] as ("correct" | "wrong")[];
    const newScore = currentScore + (isCorrect ? 1 : 0);

    if (currentLevel + 1 >= TOTAL_LEVELS) {
      const newResult: PlayerResult = {
        name: currentPlayer.name,
        score: newScore,
        answers: newAnswers,
        finished: true,
      };
      const newResults = [...results, newResult];
      setResults(newResults);

      if (currentPlayerIdx + 1 >= players.length) {
        setPhase("results");
      } else {
        setCurrentPlayerIdx((p) => p + 1);
        setCurrentLevel(0);
        setCurrentAnswers([]);
        setCurrentScore(0);
        setSelectedOption(null);
        setShowResult(false);
      }
    } else {
      setCurrentAnswers(newAnswers);
      setCurrentScore(newScore);
      setCurrentLevel((l) => l + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const resetGame = () => {
    setPhase("setup");
    setPlayerNames([""]);
    setPlayers([]);
    setResults([]);
    setCurrentPlayerIdx(0);
    setCurrentLevel(0);
    setCurrentAnswers([]);
    setCurrentScore(0);
    setSelectedOption(null);
    setShowResult(false);
  };

  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🎮</div>
            <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">Jogo do Percurso</h1>
            <p className="text-purple-200 text-sm">
              10 níveis • 3 opções por nível • 1 caminho único para cada jogador
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-white font-bold text-lg mb-4">👥 Jogadores</h2>
            <div className="space-y-3 mb-4">
              {playerNames.map((name, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayer(i, e.target.value)}
                    placeholder={`Nome do jogador ${i + 1}`}
                    className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-white/60 focus:bg-white/25 transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addPlayer();
                    }}
                  />
                  {playerNames.length > 1 && (
                    <button
                      onClick={() => removePlayer(i)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/40 hover:bg-red-500/70 flex items-center justify-center text-white transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addPlayer}
              className="w-full py-2 rounded-xl border-2 border-dashed border-white/30 text-purple-200 hover:border-white/60 hover:text-white transition text-sm font-medium mb-6"
            >
              + Adicionar jogador
            </button>

            <button
              onClick={startGame}
              disabled={playerNames.every((n) => !n.trim())}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-lg shadow-lg shadow-purple-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🚀 Iniciar Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "playing" && currentQuestion) {
    const progress = ((currentLevel + 1) / TOTAL_LEVELS) * 100;
    const isCorrect = showResult && selectedOption === currentQuestion.correctIndex;
    const isWrong = showResult && selectedOption !== currentQuestion.correctIndex;
    const colorGradient = LEVEL_COLORS[currentLevel];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-4">
            <div className="text-purple-200 text-sm font-medium mb-1">
              Jogador {currentPlayerIdx + 1} de {players.length}
            </div>
            <h2 className="text-2xl font-extrabold text-white">{currentPlayer.name}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200 text-sm font-medium">Nível {currentLevel + 1} / {TOTAL_LEVELS}</span>
              <span className="text-purple-200 text-sm">
                ✅ {currentAnswers.filter((a) => a === "correct").length} corretas
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorGradient} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex gap-1 mt-2">
              {Array.from({ length: TOTAL_LEVELS }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < currentLevel
                      ? currentAnswers[i] === "correct"
                        ? "bg-green-400"
                        : "bg-red-400"
                      : i === currentLevel
                      ? "bg-white"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 bg-gradient-to-r ${colorGradient} text-white`}>
              🏔️ NÍVEL {currentLevel + 1}
            </div>

            <p className="text-white text-lg font-semibold mb-6 leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => {
                let btnClass =
                  "w-full text-left px-5 py-3.5 rounded-xl font-medium transition-all border-2 ";

                if (!showResult) {
                  btnClass += "bg-white/10 border-white/20 text-white hover:bg-white/25 hover:border-white/50 cursor-pointer";
                } else if (i === currentQuestion.correctIndex) {
                  btnClass += "bg-green-500/30 border-green-400 text-green-100";
                } else if (i === selectedOption && selectedOption !== currentQuestion.correctIndex) {
                  btnClass += "bg-red-500/30 border-red-400 text-red-100";
                } else {
                  btnClass += "bg-white/5 border-white/10 text-white/50";
                }

                return (
                  <button
                    key={i}
                    className={btnClass}
                    onClick={() => handleOptionClick(i)}
                    disabled={showResult}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {["A", "B", "C"][i]}
                      </span>
                      {opt}
                      {showResult && i === currentQuestion.correctIndex && (
                        <span className="ml-auto text-green-300">✓</span>
                      )}
                      {showResult && i === selectedOption && i !== currentQuestion.correctIndex && (
                        <span className="ml-auto text-red-300">✗</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-5">
                <div
                  className={`rounded-xl p-3 text-center text-sm font-bold mb-4 ${
                    isCorrect
                      ? "bg-green-500/20 text-green-200 border border-green-500/30"
                      : "bg-red-500/20 text-red-200 border border-red-500/30"
                  }`}
                >
                  {isCorrect ? "🎉 Correto! Ótimo trabalho!" : `❌ Errou! A resposta era: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-base shadow-lg shadow-purple-500/30 transition"
                >
                  {currentLevel + 1 >= TOTAL_LEVELS ? "Ver Resultado 🏆" : "Próximo Nível →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const sorted = [...results].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🏆</div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Resultado Final</h1>
            <p className="text-purple-200 text-sm">Parabéns a todos os participantes!</p>
          </div>

          <div className="space-y-3 mb-6">
            {sorted.map((r, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const medal = medals[i] || "🏅";
              const percent = Math.round((r.score / TOTAL_LEVELS) * 100);

              return (
                <div
                  key={r.name}
                  className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border ${
                    i === 0 ? "border-yellow-400/50 bg-yellow-400/5" : "border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{medal}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{r.name}</span>
                        <span className="text-white font-bold">
                          {r.score}/{TOTAL_LEVELS} ({percent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {r.answers.map((a, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-2 rounded-full ${
                          a === "correct" ? "bg-green-400" : "bg-red-400"
                        }`}
                        title={`Nível ${idx + 1}: ${a === "correct" ? "correto" : "errado"}`}
                      />
                    ))}
                  </div>

                  <div className="mt-1 flex gap-2">
                    <span className="text-xs text-green-300">
                      ✅ {r.answers.filter((a) => a === "correct").length} corretas
                    </span>
                    <span className="text-xs text-red-300">
                      ❌ {r.answers.filter((a) => a === "wrong").length} erradas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetGame}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-base shadow-lg shadow-purple-500/30 transition"
          >
            🔄 Jogar Novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
}
