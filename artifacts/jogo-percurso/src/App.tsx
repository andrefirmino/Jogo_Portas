import { useState, useCallback } from "react";

const TOTAL_LEVELS = 10;
const DOORS = [
  { id: "blue", label: "Azul", emoji: "🔵", bg: "from-blue-500 to-blue-700", border: "border-blue-400", glow: "shadow-blue-500/60" },
  { id: "yellow", label: "Amarela", emoji: "🟡", bg: "from-yellow-400 to-yellow-600", border: "border-yellow-300", glow: "shadow-yellow-400/60" },
  { id: "red", label: "Vermelha", emoji: "🔴", bg: "from-red-500 to-red-700", border: "border-red-400", glow: "shadow-red-500/60" },
];

type DoorId = "blue" | "yellow" | "red";

function seededRandom(seed: number): number {
  const s = ((seed * 1664525 + 1013904223) >>> 0);
  return s / 0xffffffff;
}

function generatePlayerDoors(name: string, playerIndex: number): DoorId[] {
  const nameSeed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const base = nameSeed * 31 + playerIndex * 997 + 12345;
  return Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const r = seededRandom(base + i * 7919);
    const idx = Math.floor(r * 3);
    return DOORS[idx].id as DoorId;
  });
}

interface Player {
  name: string;
  currentLevel: number;
  doorSequence: DoorId[];
  finished: boolean;
  history: { level: number; chose: DoorId; correct: DoorId; passed: boolean }[];
}

type GamePhase = "setup" | "playing" | "results";

function Medal({ rank }: { rank: number }) {
  if (rank === 0) return <span className="text-3xl">🥇</span>;
  if (rank === 1) return <span className="text-3xl">🥈</span>;
  if (rank === 2) return <span className="text-3xl">🥉</span>;
  return <span className="text-3xl">🏅</span>;
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [chosenDoor, setChosenDoor] = useState<DoorId | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [finishedOrder, setFinishedOrder] = useState<string[]>([]);

  const addPlayer = () => setPlayerNames((p) => [...p, ""]);
  const removePlayer = (i: number) => setPlayerNames((p) => p.filter((_, idx) => idx !== i));
  const updatePlayer = (i: number, val: string) =>
    setPlayerNames((p) => p.map((n, idx) => (idx === i ? val : n)));

  const startGame = () => {
    const validNames = playerNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) return;
    const newPlayers: Player[] = validNames.map((name, i) => ({
      name,
      currentLevel: 1,
      doorSequence: generatePlayerDoors(name, i),
      finished: false,
      history: [],
    }));
    setPlayers(newPlayers);
    setCurrentPlayerIdx(0);
    setChosenDoor(null);
    setShowReveal(false);
    setFinishedOrder([]);
    setPhase("playing");
  };

  const activePlayers = players.filter((p) => !p.finished);
  const currentPlayer = activePlayers[currentPlayerIdx] ?? null;
  const currentPlayerGlobalIdx = currentPlayer
    ? players.findIndex((p) => p.name === currentPlayer.name)
    : -1;

  const correctDoor: DoorId | null =
    currentPlayer ? currentPlayer.doorSequence[currentPlayer.currentLevel - 1] : null;

  const handleDoorClick = useCallback(
    (doorId: DoorId) => {
      if (showReveal || chosenDoor !== null) return;
      setChosenDoor(doorId);
      setShowReveal(true);
    },
    [showReveal, chosenDoor]
  );

  const handleNext = () => {
    if (!currentPlayer || correctDoor === null) return;
    const passed = chosenDoor === correctDoor;

    const newHistory = [
      ...currentPlayer.history,
      { level: currentPlayer.currentLevel, chose: chosenDoor!, correct: correctDoor, passed },
    ];

    const newLevel = passed ? currentPlayer.currentLevel + 1 : 1;
    const justFinished = passed && currentPlayer.currentLevel === TOTAL_LEVELS;

    const updatedPlayers = players.map((p) => {
      if (p.name !== currentPlayer.name) return p;
      return {
        ...p,
        currentLevel: justFinished ? TOTAL_LEVELS : newLevel,
        finished: justFinished,
        history: newHistory,
      };
    });

    let newFinishedOrder = finishedOrder;
    if (justFinished) {
      newFinishedOrder = [...finishedOrder, currentPlayer.name];
      setFinishedOrder(newFinishedOrder);
    }

    setPlayers(updatedPlayers);

    const newActive = updatedPlayers.filter((p) => !p.finished);

    if (newActive.length === 0) {
      setPhase("results");
      return;
    }

    const nextIdx = (currentPlayerIdx + 1) % newActive.length;
    setCurrentPlayerIdx(nextIdx < newActive.length ? nextIdx : 0);
    setChosenDoor(null);
    setShowReveal(false);
  };

  const resetGame = () => {
    setPhase("setup");
    setPlayerNames([""]);
    setPlayers([]);
    setCurrentPlayerIdx(0);
    setChosenDoor(null);
    setShowReveal(false);
    setFinishedOrder([]);
  };

  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🚪</div>
            <h1 className="text-4xl font-extrabold text-white mb-2">Jogo das Portas</h1>
            <p className="text-purple-300 text-sm">
              Escolha a porta certa e suba os {TOTAL_LEVELS} níveis! Errou? Volta ao 1.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {DOORS.map((d) => (
              <div
                key={d.id}
                className={`w-16 h-20 rounded-xl bg-gradient-to-b ${d.bg} flex items-center justify-center text-2xl shadow-lg`}
              >
                {d.emoji}
              </div>
            ))}
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
                    className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-white/60 transition"
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
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
              className="w-full py-2 rounded-xl border-2 border-dashed border-white/30 text-purple-200 hover:border-white/60 hover:text-white transition text-sm font-medium mb-5"
            >
              + Adicionar jogador
            </button>

            <button
              onClick={startGame}
              disabled={playerNames.every((n) => !n.trim())}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-lg shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🚀 Iniciar Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "playing" && currentPlayer && correctDoor) {
    const passed = chosenDoor === correctDoor;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4 gap-5">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Jogo das Portas</span>
            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white text-xs font-semibold transition"
            >
              🔄 Reiniciar
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {players.map((p) => (
              <div
                key={p.name}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  p.finished
                    ? "bg-yellow-400/20 border-yellow-400/50 text-yellow-200"
                    : p.name === currentPlayer.name
                    ? "bg-white/25 border-white/60 text-white"
                    : "bg-white/8 border-white/20 text-white/60"
                }`}
              >
                <span>{p.finished ? "🏆" : `Nv.${p.currentLevel}`}</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-2xl">
            <div className="text-center mb-5">
              <p className="text-purple-300 text-sm mb-1">
                Vez de
              </p>
              <h2 className="text-2xl font-extrabold text-white">{currentPlayer.name}</h2>

              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex gap-1">
                  {Array.from({ length: TOTAL_LEVELS }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        i + 1 < currentPlayer.currentLevel
                          ? "bg-green-500 text-white"
                          : i + 1 === currentPlayer.currentLevel
                          ? "bg-white text-purple-900"
                          : "bg-white/15 text-white/40"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-purple-300 text-xs mt-2 font-semibold">
                Nível {currentPlayer.currentLevel} de {TOTAL_LEVELS}
              </p>
            </div>

            <p className="text-white/70 text-center text-sm mb-6 font-medium">
              🚪 Escolha uma porta para continuar...
            </p>

            <div className="grid grid-cols-3 gap-3">
              {DOORS.map((door) => {
                const isChosen = chosenDoor === door.id;
                const isCorrectDoor = correctDoor === door.id;

                let containerClass = `relative rounded-2xl border-2 transition-all duration-300 overflow-hidden cursor-pointer `;

                if (!showReveal) {
                  containerClass += `${door.border} hover:scale-105 hover:shadow-xl hover:${door.glow} active:scale-95`;
                } else if (isCorrectDoor && passed && isChosen) {
                  containerClass += `border-green-400 scale-105 shadow-2xl shadow-green-500/50`;
                } else if (isCorrectDoor) {
                  containerClass += `border-green-400 shadow-lg shadow-green-500/30`;
                } else if (isChosen && !passed) {
                  containerClass += `border-red-400 opacity-80`;
                } else {
                  containerClass += `border-white/15 opacity-40`;
                }

                return (
                  <button
                    key={door.id}
                    className={containerClass}
                    onClick={() => handleDoorClick(door.id as DoorId)}
                    disabled={showReveal}
                  >
                    <div className={`bg-gradient-to-b ${door.bg} p-5 flex flex-col items-center gap-2`}>
                      <div className="text-5xl">🚪</div>
                      <span className="text-white font-bold text-sm">{door.label}</span>
                    </div>

                    {showReveal && isCorrectDoor && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                        <span className="text-3xl">✓</span>
                      </div>
                    )}
                    {showReveal && isChosen && !isCorrectDoor && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                        <span className="text-3xl">✗</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {showReveal && (
              <div className="mt-5">
                <div
                  className={`rounded-xl p-3 text-center font-bold mb-4 ${
                    passed
                      ? "bg-green-500/20 text-green-200 border border-green-500/30"
                      : "bg-red-500/20 text-red-200 border border-red-500/30"
                  }`}
                >
                  {passed
                    ? currentPlayer.currentLevel === TOTAL_LEVELS
                      ? `🏆 ${currentPlayer.name} completou todos os níveis!`
                      : `🎉 Acertou! Avança para o nível ${currentPlayer.currentLevel + 1}!`
                    : `😬 Errou! ${currentPlayer.name} volta ao nível 1!`}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-base shadow-lg transition"
                >
                  {activePlayers.length === 1 && passed && currentPlayer.currentLevel === TOTAL_LEVELS
                    ? "Ver Resultados 🏆"
                    : "Próxima Vez →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const sorted = [...players].sort((a, b) => {
      const aPos = finishedOrder.indexOf(a.name);
      const bPos = finishedOrder.indexOf(b.name);
      if (aPos !== -1 && bPos !== -1) return aPos - bPos;
      if (aPos !== -1) return -1;
      if (bPos !== -1) return 1;
      return b.currentLevel - a.currentLevel;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🏆</div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Resultado Final</h1>
            <p className="text-purple-300 text-sm">Parabéns a todos!</p>
          </div>

          <div className="space-y-3 mb-6">
            {sorted.map((p, i) => {
              const correctCount = p.history.filter((h) => h.passed).length;
              const totalAttempts = p.history.length;
              return (
                <div
                  key={p.name}
                  className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border ${
                    i === 0 ? "border-yellow-400/50 bg-yellow-400/5" : "border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Medal rank={i} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-lg">{p.name}</span>
                        <span className="text-white/80 text-sm font-semibold">
                          {p.finished ? "✅ Concluído!" : `Nível ${p.currentLevel}`}
                        </span>
                      </div>
                      <div className="text-purple-300 text-xs mt-1">
                        {correctCount} acertos em {totalAttempts} tentativas
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetGame}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-base shadow-lg transition"
          >
            🔄 Jogar Novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
}
