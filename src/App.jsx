import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <header className="app-header">
          <div className="app-header-inner">
            <span className="app-logo">🔢 猜數字遊戲</span>
            <nav className="app-nav">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                遊戲
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                歷史紀錄
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<GamePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>猜數字遊戲 &copy; 2026 — 隨機猜 1 到 100 的整數</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
