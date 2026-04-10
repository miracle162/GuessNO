# GuessNO — 猜數字遊戲

An interactive number-guessing web game (1–100) built with React + Vite.

## Features

- 🎮 **Core Game**: Randomly generated target (1–100); guess with "大了" / "小了" / "恭喜通過！" feedback
- 📋 **Guess History**: Every guess shown with timestamp and feedback colour-coded in real time
- 📊 **Statistics Page**: Best score, average guesses, total games, and a trend line chart (Chart.js)
- 💾 **localStorage Persistence**: Game history saved across sessions (no backend required)
- ✅ **Input Validation**: Frontend blocks out-of-range (< 1 or > 100) and non-integer input
- 📱 **Responsive Design**: Works on desktop and mobile

## Getting Started

```bash
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
npm run lint       # lint with ESLint
```

## Tech Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Charts**: Chart.js + react-chartjs-2
- **Storage**: Browser localStorage
