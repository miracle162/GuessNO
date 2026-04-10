import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { loadGames, computeStats, getDurationSeconds } from '../utils/gameStorage';
import './HistoryPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function HistoryPage() {
  const [games, setGames] = useState(() => {
    const stored = loadGames();
    return [...stored].sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
  });
  const [stats, setStats] = useState(() => computeStats(loadGames()));

  function handleClearHistory() {
    if (window.confirm('確定要清除所有歷史紀錄嗎？此操作無法復原。')) {
      localStorage.removeItem('guessno_games');
      setGames([]);
      setStats({ best: null, average: null, recent: [], totalGames: 0 });
    }
  }

  const chartData = stats && stats.recent.length > 0
    ? {
        labels: stats.recent.map((r, i) => `第 ${i + 1} 場`),
        datasets: [
          {
            label: '猜測次數',
            data: stats.recent.map(r => r.guessesCount),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.1)',
            pointBackgroundColor: '#4f46e5',
            pointRadius: 5,
            tension: 0.3,
            fill: true,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '最近場次猜測次數趨勢',
        font: { size: 14, weight: 'bold' },
        color: '#1e293b',
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` 猜了 ${ctx.raw} 次`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: '猜測次數' },
      },
      x: {
        title: { display: true, text: '場次' },
      },
    },
  };

  return (
    <div className="container-wide">
      {/* Page title */}
      <div className="history-header flex items-center justify-between mt-2">
        <h1 className="text-2xl font-bold">📊 歷史紀錄與統計</h1>
        <Link to="/">
          <button className="btn-primary">🎮 返回遊戲</button>
        </Link>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="stats-grid mt-3">
          <div className="stat-card card">
            <div className="stat-icon">🏆</div>
            <div className="stat-label">最佳成績</div>
            <div className="stat-value text-success">
              {stats.best !== null ? `${stats.best} 次` : '—'}
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">📈</div>
            <div className="stat-label">平均猜測次數</div>
            <div className="stat-value text-info">
              {stats.average !== null ? `${stats.average} 次` : '—'}
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">🎯</div>
            <div className="stat-label">總遊戲場次</div>
            <div className="stat-value">{stats.totalGames}</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">成功完成</div>
            <div className="stat-value">
              {games.filter(g => g.success).length}
            </div>
          </div>
        </div>
      )}

      {/* Trend chart */}
      {chartData && (
        <div className="card mt-3 chart-card">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* History table */}
      <div className="card mt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">遊戲紀錄</h2>
          {games.length > 0 && (
            <button className="btn-outline btn-sm" onClick={handleClearHistory}>
              🗑 清除紀錄
            </button>
          )}
        </div>

        {games.length === 0 ? (
          <div className="empty-state mt-3">
            <p className="text-xl">🎮</p>
            <p className="text-muted mt-1">尚無遊戲紀錄，快去玩一場吧！</p>
            <Link to="/">
              <button className="btn-primary mt-2">開始遊戲</button>
            </Link>
          </div>
        ) : (
          <div className="table-wrapper mt-2">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>開始時間</th>
                  <th>猜測次數</th>
                  <th>結果</th>
                  <th>耗時（秒）</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, idx) => {
                  const duration = getDurationSeconds(game);
                  return (
                    <tr key={game.id}>
                      <td className="text-muted">{games.length - idx}</td>
                      <td>
                        {game.startAt
                          ? new Date(game.startAt).toLocaleString('zh-TW', {
                              month: '2-digit', day: '2-digit',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="text-center font-bold">{game.guessesCount}</td>
                      <td>
                        <span className={`result-badge ${game.success ? 'result-success' : 'result-incomplete'}`}>
                          {game.success ? '✅ 成功' : '⏳ 未完成'}
                        </span>
                      </td>
                      <td className="text-center">
                        {duration !== null ? `${duration}s` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
