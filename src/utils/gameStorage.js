const STORAGE_KEY = 'guessno_games';

/**
 * Load all game sessions from localStorage.
 * @returns {Array} Array of game session objects
 */
export function loadGames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a game session to localStorage.
 * @param {Object} session - Game session object
 */
export function saveGame(session) {
  const games = loadGames();
  const idx = games.findIndex(g => g.id === session.id);
  if (idx >= 0) {
    games[idx] = session;
  } else {
    games.push(session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

/**
 * Create a new game session.
 * @returns {Object} New game session
 */
export function createGameSession() {
  const target = Math.floor(Math.random() * 100) + 1;
  return {
    id: crypto.randomUUID(),
    target,
    startAt: new Date().toISOString(),
    endAt: null,
    guessesCount: 0,
    success: false,
    guesses: [],
  };
}

/**
 * Process a guess in a game session.
 * @param {Object} session - Current game session
 * @param {number} value - Guessed number
 * @returns {{ session: Object, feedback: string }}
 */
export function processGuess(session, value) {
  let feedback;
  if (value > session.target) {
    feedback = 'TOO_HIGH';
  } else if (value < session.target) {
    feedback = 'TOO_LOW';
  } else {
    feedback = 'CORRECT';
  }

  const guess = {
    value,
    feedback,
    createdAt: new Date().toISOString(),
  };

  const updatedSession = {
    ...session,
    guessesCount: session.guessesCount + 1,
    guesses: [...session.guesses, guess],
    success: feedback === 'CORRECT',
    endAt: feedback === 'CORRECT' ? new Date().toISOString() : null,
  };

  return { session: updatedSession, feedback };
}

/**
 * Compute stats from all completed game sessions.
 * @param {Array} games - All game sessions
 * @returns {{ best: number|null, average: number|null, recent: Array, totalGames: number }}
 */
export function computeStats(games) {
  const completed = games.filter(g => g.success);
  if (completed.length === 0) {
    return { best: null, average: null, stdDev: null, recent: [], totalGames: games.length };
  }
  const counts = completed.map(g => g.guessesCount);
  const best = Math.min(...counts);
  const rawMean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const average = Math.round(rawMean * 10) / 10;
  const stdDev = completed.length > 1
    ? Math.round(Math.sqrt(counts.reduce((sum, c) => sum + (c - rawMean) ** 2, 0) / counts.length) * 10) / 10
    : null;
  const recent = [...completed]
    .sort((a, b) => new Date(a.endAt) - new Date(b.endAt))
    .slice(-20)
    .map(g => ({
      date: g.endAt ? new Date(g.endAt).toLocaleDateString('zh-TW') : '',
      guessesCount: g.guessesCount,
    }));
  return { best, average, stdDev, recent, totalGames: games.length };
}

/**
 * Get the duration in seconds for a game session.
 * @param {Object} session
 * @returns {number|null}
 */
export function getDurationSeconds(session) {
  if (!session.startAt || !session.endAt) return null;
  return Math.round((new Date(session.endAt) - new Date(session.startAt)) / 1000);
}
