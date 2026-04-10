import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createGameSession, processGuess, saveGame } from '../utils/gameStorage';
import './GamePage.css';

const FEEDBACK_CONFIG = {
  TOO_HIGH: { label: '大了！數字太大，請猜小一點', className: 'feedback-high', icon: '🔴' },
  TOO_LOW:  { label: '小了！數字太小，請猜大一點', className: 'feedback-low',  icon: '🔵' },
  CORRECT:  { label: '🎉 恭喜通過！答對了！',        className: 'feedback-correct', icon: '✅' },
};

export default function GamePage() {
  const [session, setSession] = useState(() => createGameSession());
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [lastFeedback, setLastFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef(null);
  const lastGuessTimeRef = useRef(0);

  const startNewGame = useCallback(() => {
    if (!gameOver && session.guessesCount > 0) {
      if (!window.confirm('目前遊戲尚未結束，確定要重新開始嗎？')) return;
    }
    setSession(createGameSession());
    setInputValue('');
    setInputError('');
    setLastFeedback(null);
    setGameOver(false);
    lastGuessTimeRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [gameOver, session.guessesCount]);

  // Auto-focus input when game is active
  useEffect(() => {
    if (!gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameOver, session]);

  function validateInput(value) {
    if (value === '' || value === null || value === undefined) {
      return '請輸入 1 到 100 的整數。';
    }
    const num = Number(value);
    if (!Number.isInteger(num)) {
      return '請輸入 1 到 100 的整數。';
    }
    if (num < 1 || num > 100) {
      return '請輸入 1 到 100 的整數。';
    }
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const error = validateInput(inputValue);
    if (error) {
      setInputError(error);
      return;
    }
    if (gameOver) return;

    // Rate limiting: at most 1 guess per 500 ms
    const now = Date.now();
    if (now - lastGuessTimeRef.current < 500) {
      setInputError('猜太快了，請稍候再試。');
      return;
    }
    lastGuessTimeRef.current = now;

    const num = Number(inputValue);
    const { session: updatedSession, feedback } = processGuess(session, num);
    setSession(updatedSession);
    setLastFeedback(feedback);
    setInputValue('');
    setInputError('');

    if (feedback === 'CORRECT') {
      setGameOver(true);
      saveGame(updatedSession);
    } else {
      saveGame(updatedSession);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleInputChange(e) {
    setInputValue(e.target.value);
    if (inputError) setInputError('');
  }

  const feedbackCfg = lastFeedback ? FEEDBACK_CONFIG[lastFeedback] : null;

  return (
    <div className="container">
      {/* Header */}
      <div className="game-header card mt-2">
        <h1 className="text-2xl font-bold">🔢 猜數字遊戲</h1>
        <p className="text-muted mt-1">
          隨機產生一個 1 到 100 之間的整數，猜猜看是哪個數字！
        </p>
      </div>

      {/* Status bar */}
      <div className="status-bar card mt-2">
        <div className="status-item">
          <span className="status-label">猜測次數</span>
          <span className="status-value text-primary">{session.guessesCount}</span>
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <span className="status-label">遊戲狀態</span>
          <span className={`status-badge ${gameOver ? 'badge-success' : 'badge-active'}`}>
            {gameOver ? '已結束' : '進行中'}
          </span>
        </div>
      </div>

      {/* Input area */}
      {!gameOver ? (
        <div className="input-area card mt-2">
          <form onSubmit={handleSubmit} className="guess-form" noValidate>
            <div className="input-group">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="\d*"
                min="1"
                max="100"
                step="1"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="輸入 1–100 的整數"
                className={inputError ? 'input-error' : ''}
                disabled={gameOver}
                aria-label="猜測數字"
              />
              <button
                type="submit"
                className="btn-primary btn-lg submit-btn"
                disabled={gameOver}
              >
                送出
              </button>
            </div>
            {inputError && (
              <p className="error-message" role="alert">{inputError}</p>
            )}
          </form>
        </div>
      ) : null}

      {/* Feedback area */}
      {feedbackCfg && (
        <div className={`feedback-area card mt-2 ${feedbackCfg.className}`} role="status" aria-live="polite" aria-atomic="true">
          <p className="feedback-text">
            {feedbackCfg.icon} {feedbackCfg.label}
          </p>
          {gameOver && (
            <p className="feedback-score">
              總共猜了 <strong>{session.guessesCount}</strong> 次！
            </p>
          )}
        </div>
      )}

      {/* Game over actions */}
      {gameOver && (
        <div className="game-over-actions card mt-2 text-center">
          <p className="text-lg font-bold text-success">🎊 遊戲結束！</p>
          <p className="text-muted mt-1">你在 {session.guessesCount} 次內猜出了答案（{session.target}）！</p>
          <div className="flex gap-2 justify-center mt-3">
            <button className="btn-success btn-lg" onClick={startNewGame}>
              🔄 再玩一次
            </button>
            <Link to="/history">
              <button className="btn-outline btn-lg">
                📊 查看歷史
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Guess history */}
      {session.guesses.length > 0 && (
        <div className="history-area card mt-2">
          <h2 className="text-lg font-bold">猜測記錄</h2>
          <div className="history-list mt-2">
            {[...session.guesses].reverse().map((guess, idx) => {
              const cfg = FEEDBACK_CONFIG[guess.feedback];
              return (
                <div key={idx} className={`history-item ${cfg.className}`}>
                  <span className="history-time">
                    {new Date(guess.createdAt).toLocaleTimeString('zh-TW')}
                  </span>
                  <span className="history-value">{guess.value}</span>
                  <span className="history-feedback">
                    {cfg.icon} {guess.feedback === 'TOO_HIGH' ? '大了' : guess.feedback === 'TOO_LOW' ? '小了' : '恭喜通過'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
